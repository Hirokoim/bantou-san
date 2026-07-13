'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { getBantou, type BantouId } from '@/lib/bantou'
import { newMessageId, type ChatMessage } from '@/lib/chat'
import { play } from '@/lib/sound'
import { saveMemoDraft, requestGeneration, applyGeneratedContent } from '@/lib/notices'
import { getRelayFor, relayKey, type RelayRule } from '@/lib/relay'

const INITIAL_GREETING = 'あなたはどの番頭さんにお願いしたいですか？右（下）からお選びください。'

// チャットメッセージ・番頭さん選択・お知らせ生成・番頭間の取り次ぎをまとめて扱う
export function useBantouChat(orgId: string | null, user: User | null) {
  const supabase = createClient()
  const [messages, setMessages] = useState<ChatMessage[]>([
    { kind: 'bantou', bantouId: 'oo', text: INITIAL_GREETING, id: newMessageId() },
  ])
  const [inputValue, setInputValue] = useState('')
  const [selectedBantou, setSelectedBantou] = useState<BantouId | null>(null)
  const [poppingId, setPoppingId] = useState<BantouId | null>(null)
  const cardRefs = useRef<Partial<Record<BantouId, HTMLButtonElement | null>>>({})
  const hasGreetedRef = useRef(false)
  const declinedRelaysRef = useRef(new Set<string>())
  const [pendingRelayNoticeId, setPendingRelayNoticeId] = useState<string | null>(null)

  // カード選択・リレー承諾の両方から呼ばれる共有ロジック
  // silent: リレー経由の選択で、名乗りの吹き出し（既にリレー提案メッセージに表示済み）を省略する
  const selectBantou = (id: BantouId, opts?: { silent?: boolean }) => {
    if (selectedBantou === id) return
    const next = getBantou(id)

    setPoppingId(id)
    setTimeout(() => setPoppingId((cur) => (cur === id ? null : cur)), 500)

    if (!hasGreetedRef.current) {
      hasGreetedRef.current = true
      play('oo', 'welcome')
    }

    if (selectedBantou && !opts?.silent) {
      const prev = getBantou(selectedBantou)
      setMessages((msgs) => [
        ...msgs,
        { kind: 'system', text: `→ 大番頭が『${prev.name}』から『${next.name}』へお取り次ぎしました`, id: newMessageId() },
      ])
      play('oo', 'handoff')
    }
    setSelectedBantou(id)
    play(id, 'select')

    if (window.matchMedia('(max-width: 767px)').matches) {
      cardRefs.current[id]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }

    if (opts?.silent) return

    const typingId = newMessageId()
    setMessages((msgs) => [...msgs, { kind: 'typing', bantouId: id, id: typingId }])

    setTimeout(() => {
      setMessages((msgs) => msgs.filter((m) => m.id !== typingId))
      if (next.implemented) {
        setMessages((msgs) => [...msgs, { kind: 'bantou', bantouId: id, text: next.selectLine, id: newMessageId() }])
        // 蔵番頭は読み取り専用のため、入力を待たず選択直後に一覧を出す
        if (id === 'kura') {
          setMessages((msgs) => [...msgs, { kind: 'past-notices', id: newMessageId() }])
        }
      } else {
        setMessages((msgs) => [...msgs, { kind: 'bantou', bantouId: id, text: next.notYetLine ?? next.selectLine, id: newMessageId() }])
      }
    }, 550)
  }

  const maybeTriggerRelay = (from: BantouId, trigger: RelayRule['trigger'], noticeId: string) => {
    const rule = getRelayFor(from, trigger)
    if (!rule) return
    if (declinedRelaysRef.current.has(relayKey(rule))) return
    setPendingRelayNoticeId(noticeId)
    setMessages((msgs) => [
      ...msgs,
      { kind: 'relay-prompt', from: rule.from, to: rule.to, message: rule.message, id: newMessageId() },
    ])
  }

  const acceptRelay = (rule: RelayRule, promptId: string) => {
    setMessages((msgs) => msgs.filter((m) => m.id !== promptId))
    selectBantou(rule.to, { silent: true })
    if (pendingRelayNoticeId) {
      setMessages((msgs) => [...msgs, { kind: 'date-picker', noticeId: pendingRelayNoticeId, id: newMessageId() }])
    }
  }

  const declineRelay = (rule: RelayRule, promptId: string) => {
    declinedRelaysRef.current.add(relayKey(rule))
    setMessages((msgs) => msgs.filter((m) => m.id !== promptId))
  }

  const runHariGeneration = async (memo: string) => {
    if (!orgId || !user) return
    const typingId = newMessageId()
    setMessages((msgs) => [...msgs, { kind: 'typing', bantouId: 'hari', id: typingId }])

    const draft = await saveMemoDraft(supabase, orgId, user.id, memo)
    if ('error' in draft) {
      setMessages((msgs) => msgs.filter((m) => m.id !== typingId))
      setMessages((msgs) => [...msgs, {
        kind: 'bantou', bantouId: 'hari',
        text: 'はり出し番頭が席を外しているようです。書いた内容は残っていますので、もう一度お試しください。',
        id: newMessageId(),
      }])
      return
    }

    const generated = await requestGeneration(memo)
    setMessages((msgs) => msgs.filter((m) => m.id !== typingId))
    if ('error' in generated) {
      setMessages((msgs) => [...msgs, {
        kind: 'bantou', bantouId: 'hari',
        text: 'はり出し番頭が席を外しているようです。書いた内容は残っていますので、もう一度お試しください。',
        id: newMessageId(),
      }])
      return
    }

    await applyGeneratedContent(supabase, draft.id, generated)
    play('hari', 'done')
    setMessages((msgs) => [
      ...msgs,
      { kind: 'bantou', bantouId: 'hari', text: getBantou('hari').doneLine, id: newMessageId() },
      { kind: 'result-card', noticeId: draft.id, bantouId: 'hari', id: newMessageId() },
    ])
    maybeTriggerRelay('hari', 'done', draft.id)
  }

  const send = () => {
    const text = inputValue.trim()
    if (!text || !selectedBantou) return
    setInputValue('')
    setMessages((msgs) => [...msgs, { kind: 'user', text, id: newMessageId() }])

    if (selectedBantou === 'hari') {
      runHariGeneration(text)
    } else if (selectedBantou === 'kura') {
      setMessages((msgs) => [...msgs, { kind: 'past-notices', id: newMessageId() }])
    }
  }

  const setCardRef = (id: BantouId, el: HTMLButtonElement | null) => {
    cardRefs.current[id] = el
  }

  return {
    messages,
    setMessages,
    inputValue,
    setInputValue,
    selectedBantou,
    poppingId,
    selectBantou,
    acceptRelay,
    declineRelay,
    send,
    setCardRef,
  }
}
