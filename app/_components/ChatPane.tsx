'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { getBantou } from '@/lib/bantou'
import type { ChatMessage } from '@/lib/chat'

const SASH_BG: Record<string, string> = {
  ai: 'bg-ai',
  hari: 'bg-hari',
  fude: 'bg-fude',
  fure: 'bg-fure',
  koyo: 'bg-koyo',
  hike: 'bg-hike',
  kura: 'bg-kura',
}

type Props = {
  messages: ChatMessage[]
  inputValue: string
  onInputChange: (v: string) => void
  onSend: () => void
  inputEnabled: boolean
  placeholder: string
  renderSpecial: (msg: ChatMessage) => ReactNode
}

export default function ChatPane({
  messages, inputValue, onInputChange, onSend, inputEnabled, placeholder, renderSpecial,
}: Props) {
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages])

  return (
    <section className="flex min-h-0 flex-1 flex-col md:basis-[57%] md:border-r md:border-line">
      <div ref={chatRef} className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
        {messages.map((msg) => {
          if (msg.kind === 'system') {
            return (
              <div key={msg.id} className="self-center text-center text-[13px] text-[#8a8072]">
                {msg.text}
              </div>
            )
          }
          if (msg.kind === 'user') {
            return (
              <div key={msg.id} className="max-w-[92%] self-end">
                <div className="rounded-[12px_4px_12px_12px] border border-[#B9CCE0] bg-[#DDE7F2] px-[13px] py-2.5 text-lg">
                  {msg.text}
                </div>
              </div>
            )
          }
          if (msg.kind === 'bantou' || msg.kind === 'typing') {
            const b = getBantou(msg.bantouId)
            return (
              <div key={msg.id} className="flex max-w-[92%] items-end gap-2.5">
                <div className={`flex h-10 w-10 flex-none items-center justify-center rounded-full text-lg text-white ${SASH_BG[b.sashColor]}`}>
                  {b.emoji}
                </div>
                <div>
                  <p className="mb-0.5 text-[11.5px] font-bold text-[#5C544A]">{b.fullName}</p>
                  <div className="rounded-[4px_12px_12px_12px] border border-line bg-card px-[13px] py-2.5 text-lg">
                    {msg.kind === 'typing' ? (
                      <span className="inline-flex gap-1.5 py-1">
                        <span className="h-[7px] w-[7px] animate-pulse rounded-full bg-[#9AA9BC]" />
                        <span className="h-[7px] w-[7px] animate-pulse rounded-full bg-[#9AA9BC] [animation-delay:0.2s]" />
                        <span className="h-[7px] w-[7px] animate-pulse rounded-full bg-[#9AA9BC] [animation-delay:0.4s]" />
                      </span>
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              </div>
            )
          }
          return <div key={msg.id}>{renderSpecial(msg)}</div>
        })}
      </div>

      <div className="flex flex-none gap-2 bg-[#EFE8D6] px-3 pb-3.5 pt-2.5">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onSend() }}
          disabled={!inputEnabled}
          placeholder={placeholder}
          aria-label="番頭さんへの伝言"
          className="min-h-[46px] flex-1 rounded-full border-2 border-line bg-card px-4 text-lg focus:outline focus:outline-[3px] focus:outline-[#7FA3CC] disabled:opacity-60"
        />
        <button
          onClick={onSend}
          disabled={!inputEnabled}
          aria-label="送る"
          className="h-[46px] w-[46px] flex-none rounded-full bg-ai text-lg text-white disabled:opacity-40"
        >
          ➤
        </button>
      </div>
    </section>
  )
}
