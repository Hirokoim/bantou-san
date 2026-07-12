'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DueDatePicker({ noticeId }: { noticeId: string }) {
  const supabase = createClient()
  const [date, setDate] = useState('')
  const [saved, setSaved] = useState(false)

  const save = async () => {
    if (!date) return
    await supabase.from('notices').update({ due_date: date }).eq('id', noticeId)
    setSaved(true)
  }

  if (saved) {
    return (
      <div className="max-w-[92%] rounded-xl border border-line bg-card p-4 text-lg">
        承知しました。{new Date(date).toLocaleDateString('ja-JP')}が近づいたら、またお声がけします。
      </div>
    )
  }

  return (
    <div className="flex max-w-[92%] items-center gap-2 rounded-xl border border-line bg-card p-4">
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        aria-label="いつまで貼っておくか"
        className="min-h-[52px] flex-1 rounded-lg border-2 border-line bg-washi px-3 text-lg"
      />
      <button
        onClick={save}
        disabled={!date}
        className="min-h-[52px] flex-none rounded-lg bg-koyo px-4 text-lg font-bold text-white disabled:opacity-40"
      >
        決める
      </button>
    </div>
  )
}
