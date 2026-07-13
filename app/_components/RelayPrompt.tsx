import { getRelayFor, type RelayRule } from '@/lib/relay'
import type { ChatMessage } from '@/lib/chat'

type RelayPromptMessage = Extract<ChatMessage, { kind: 'relay-prompt' }>

type Props = {
  msg: RelayPromptMessage
  onAccept: (rule: RelayRule, promptId: string) => void
  onDecline: (rule: RelayRule, promptId: string) => void
}

export default function RelayPrompt({ msg, onAccept, onDecline }: Props) {
  const rule = getRelayFor(msg.from, 'done')
  if (!rule) return null

  return (
    <div className="max-w-[92%] rounded-xl border border-line bg-card p-4">
      <p className="mb-3 text-xl">{msg.message}</p>
      <div className="flex gap-2">
        <button
          onClick={() => onAccept(rule, msg.id)}
          className="min-h-[52px] flex-1 rounded-lg bg-koyo px-3 text-lg font-bold text-white"
        >
          お願いする
        </button>
        <button
          onClick={() => onDecline(rule, msg.id)}
          className="min-h-[52px] flex-1 rounded-lg border-2 border-line px-3 text-lg font-bold text-ink"
        >
          今はいいです
        </button>
      </div>
    </div>
  )
}
