import type { BantouId } from './bantou'

export type ChatMessage =
  | { kind: 'bantou'; bantouId: BantouId; text: string; id: string }
  | { kind: 'user'; text: string; id: string }
  | { kind: 'system'; text: string; id: string }
  | { kind: 'typing'; bantouId: BantouId; id: string }
  | { kind: 'result-card'; noticeId: string; bantouId: BantouId; id: string }
  | { kind: 'relay-prompt'; from: BantouId; to: BantouId; message: string; id: string }
  | { kind: 'past-notices'; id: string }
  | { kind: 'date-picker'; noticeId: string; id: string }

let counter = 0
export function newMessageId(): string {
  counter += 1
  return `m${Date.now()}-${counter}`
}
