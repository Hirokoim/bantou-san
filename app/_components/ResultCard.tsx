'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Notice = {
  id: string
  title: string
  signage_body: string | null
  poster_body: string | null
  circular_body: string | null
}

const TABS = [
  { id: 'signage', label: 'サイネージ', field: 'signage_body' },
  { id: 'poster', label: '掲示板ポスター', field: 'poster_body' },
  { id: 'circular', label: '回覧板', field: 'circular_body' },
] as const

type Props = {
  noticeId: string
  onRetry: () => void
}

export default function ResultCard({ noticeId, onRetry }: Props) {
  const supabase = createClient()
  const [notice, setNotice] = useState<Notice | null>(null)
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('signage')
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('notices')
        .select('id, title, signage_body, poster_body, circular_body')
        .eq('id', noticeId).single()
      setNotice(data)
    }
    load()
  }, [noticeId])

  if (!notice) return null

  const activeTab = TABS.find((t) => t.id === tab)!
  const body = notice[activeTab.field]

  return (
    <div className="max-w-[92%] rounded-xl border border-line bg-card p-4">
      <h3 className="mb-2 font-display text-xl font-bold text-ai-deep">{notice.title}</h3>

      <div className="mb-2 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`min-h-[44px] rounded-full px-4 py-2 text-base font-bold ${
              tab === t.id ? 'bg-ai text-white' : 'bg-washi text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mb-3 whitespace-pre-wrap rounded-lg bg-washi p-4 text-lg leading-relaxed">
        {body || 'まだ生成されていません。'}
      </div>

      {confirmed ? (
        <p className="text-base text-matsu">承知しました。</p>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => setConfirmed(true)}
            className="min-h-[52px] flex-1 rounded-lg bg-ai px-3 text-lg font-bold text-white"
          >
            これで貼り出す
          </button>
          <button
            onClick={onRetry}
            className="min-h-[52px] flex-1 rounded-lg border-2 border-line px-3 text-lg font-bold text-ink"
          >
            直してもらう
          </button>
        </div>
      )}
    </div>
  )
}
