'use client'

import { useEffect, useState } from 'react'
import { getBantou } from '@/lib/bantou'
import { newMessageId } from '@/lib/chat'
import { isMuted, setMuted } from '@/lib/sound'
import { useOrgSession } from './_hooks/useOrgSession'
import { useBantouChat } from './_hooks/useBantouChat'
import NorenHeader from './_components/NorenHeader'
import ChatPane from './_components/ChatPane'
import BantouGrid from './_components/BantouGrid'
import ResultCard from './_components/ResultCard'
import PastNoticesList from './_components/PastNoticesList'
import DueDatePicker from './_components/DueDatePicker'
import RelayPrompt from './_components/RelayPrompt'

export default function Home() {
  const { user, orgId, orgName, logout } = useOrgSession()
  const [muted, setMutedState] = useState(false)
  const {
    messages, setMessages, inputValue, setInputValue,
    selectedBantou, poppingId, selectBantou, acceptRelay, declineRelay, send, setCardRef,
  } = useBantouChat(orgId, user)

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

  if (!user || !orgId) return null

  const activeBantou = selectedBantou ? getBantou(selectedBantou) : null
  const inputEnabled = !!activeBantou?.implemented
  const placeholder = activeBantou
    ? `${activeBantou.fullName}に伝える`
    : '番頭さんを選んでからどうぞ'

  return (
    <main className="flex h-screen flex-col overflow-hidden">
      <NorenHeader orgName={orgName} muted={muted} onToggleMute={toggleMute} onLogout={logout} />
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
              return <RelayPrompt msg={msg} onAccept={acceptRelay} onDecline={declineRelay} />
            }
            return null
          }}
        />
        <BantouGrid
          selected={selectedBantou}
          poppingId={poppingId}
          onSelect={selectBantou}
          cardRef={setCardRef}
        />
      </div>
    </main>
  )
}
