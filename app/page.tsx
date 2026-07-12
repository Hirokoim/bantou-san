'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { getBantou, type BantouId } from '@/lib/bantou'
import { newMessageId, type ChatMessage } from '@/lib/chat'
import { isMuted, setMuted, play } from '@/lib/sound'
import { saveMemoDraft, requestGeneration, applyGeneratedContent } from '@/lib/notices'
import { getRelayFor, relayKey, type RelayRule } from '@/lib/relay'
import NorenHeader from './_components/NorenHeader'
import ChatPane from './_components/ChatPane'
import BantouGrid from './_components/BantouGrid'
import ResultCard from './_components/ResultCard'
import PastNoticesList from './_components/PastNoticesList'
import DueDatePicker from './_components/DueDatePicker'

const INITIAL_GREETING = 'あなたはどの番頭さんにお願いしたいですか？右（下）からお選びください。'

export default function Home() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [orgId, setOrgId] = useState<string | null>(null)
  const [orgName, setOrgName] = useState('')
  const [muted, setMutedState] = useState(false)
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

  // ミュート状態はlocalStorageから復元（SSR/ハイドレーション不整合を避けるためマウント後に読む）
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorageはクライアントでしか読めないため
    setMutedState(isMuted())
  }, [])

  const toggleMute = () => {
    setMutedState((cur) => {
      const next = !cur
      setMuted(next)
      return next
    })
  }

  // 起動時：ログイン状態と所属組合を読み込む（組合が無ければ自動で作る）
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }
      setUser(user)

      const { data: m } = await supabase.from('memberships').select('organization_id').limit(1)
      let currentOrgId = m && m.length > 0 ? m[0].organization_id : null

      if (!currentOrgId) {
        const { data: org } = await supabase.from('organizations')
          .insert({ name: 'さくら台マンション管理組合' }).select().single()
        if (org) {
          await supabase.from('memberships')
            .insert({ user_id: user.id, organization_id: org.id, role: 'chair' })
          currentOrgId = org.id
        }
      }

      if (currentOrgId) {
        setOrgId(currentOrgId)
        const { data: org } = await supabase.from('organizations')
          .select('name').eq('id', currentOrgId).single()
        if (org) setOrgName(org.name)
      }
    }
    load()
  }, [])

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

  if (!user || !orgId) return null

  const activeBantou = selectedBantou ? getBantou(selectedBantou) : null
  const inputEnabled = !!activeBantou?.implemented
  const placeholder = activeBantou
    ? `${activeBantou.fullName}に伝える`
    : '番頭さんを選んでからどうぞ'

  return (
    <main className="flex h-screen flex-col overflow-hidden">
      <NorenHeader orgName={orgName} muted={muted} onToggleMute={toggleMute} />
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <ChatPane
          messages={messages}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSend={send}
          inputEnabled={inputEnabled}
          placeholder={placeholder}
          renderSpecial={(msg) => {
            if (msg.kind === 'result-card') {
              return (
                <ResultCard
                  noticeId={msg.noticeId}
                  onRetry={() => setMessages((msgs) => [
                    ...msgs,
                    { kind: 'bantou', bantouId: 'hari', text: 'どのように直しましょうか。書き直してお送りください。', id: newMessageId() },
                  ])}
                />
              )
            }
            if (msg.kind === 'past-notices' && orgId) {
              return <PastNoticesList orgId={orgId} />
            }
            if (msg.kind === 'date-picker') {
              return <DueDatePicker noticeId={msg.noticeId} />
            }
            if (msg.kind === 'relay-prompt') {
              const rule = getRelayFor(msg.from, 'done')
              if (!rule) return null
              return (
                <div className="max-w-[92%] rounded-xl border border-line bg-card p-4">
                  <p className="mb-3 text-lg">{msg.message}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => acceptRelay(rule, msg.id)}
                      className="min-h-[44px] flex-1 rounded-lg bg-koyo px-3 text-base font-bold text-white"
                    >
                      お願いする
                    </button>
                    <button
                      onClick={() => declineRelay(rule, msg.id)}
                      className="min-h-[44px] flex-1 rounded-lg border-2 border-line px-3 text-base font-bold text-ink"
                    >
                      今はいいです
                    </button>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <BantouGrid
          selected={selectedBantou}
          poppingId={poppingId}
          onSelect={selectBantou}
          cardRef={(id, el) => { cardRefs.current[id] = el }}
        />
      </div>
    </main>
  )
}
