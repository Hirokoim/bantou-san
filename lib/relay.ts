import type { BantouId } from './bantou'

export type RelayRule = {
  from: BantouId
  trigger: 'done'
  to: BantouId
  message: string
  phase: 1
}

// Phase 2/3のパターン（②〜⑥）は同じ形の要素を追加するだけで拡張できる
export const RELAY_RULES: RelayRule[] = [
  {
    from: 'hari',
    trigger: 'done',
    to: 'koyo',
    message: '暦番頭です。この掲示、いつまで貼っておきますか？期限を決めておけば、下げ時をお声がけしますよ。',
    phase: 1,
  },
]

export function getRelayFor(from: BantouId, trigger: RelayRule['trigger']): RelayRule | undefined {
  return RELAY_RULES.find((r) => r.from === from && r.trigger === trigger && r.phase === 1)
}

export function relayKey(rule: Pick<RelayRule, 'from' | 'trigger' | 'to'>): string {
  return `${rule.from}-${rule.trigger}-${rule.to}`
}
