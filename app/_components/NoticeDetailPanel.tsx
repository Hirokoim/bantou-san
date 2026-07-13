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

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function NoticeDetailPanel({ noticeId }: { noticeId: string }) {
  const supabase = createClient()
  const [notice, setNotice] = useState<Notice | null>(null)
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('signage')

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('notices')
        .select('id, title, signage_body, poster_body, circular_body')
        .eq('id', noticeId).single()
      setNotice(data)
    }
    load()
  }, [noticeId])

  if (!notice) return <p className="text-lg">読み込んでいます…</p>

  const activeTab = TABS.find((t) => t.id === tab)!
  const body = notice[activeTab.field]

  return (
    <div className="rounded-xl border border-line bg-card p-4">
      <h2 className="mb-3 font-display text-xl font-bold text-ai-deep">{notice.title}</h2>

      <div className="mb-3 flex flex-wrap gap-2">
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

      <button
        onClick={() => downloadText(`${notice.title}_${activeTab.label}.txt`, body || '')}
        disabled={!body}
        className="min-h-[52px] w-full rounded-lg border-2 border-line text-lg font-bold text-ink disabled:opacity-40"
      >
        {activeTab.label}をダウンロード
      </button>
    </div>
  )
}
