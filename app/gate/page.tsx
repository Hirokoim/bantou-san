'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function GateForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!password) return
    setLoading(true)
    setError(false)
    const res = await fetch('/api/gate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    setLoading(false)
    if (!res.ok) { setError(true); return }
    router.push(searchParams.get('next') || '/')
    router.refresh()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-washi p-6">
      <div className="w-full max-w-sm space-y-4 rounded-2xl border border-line bg-card p-8 text-center">
        <h1 className="font-display text-2xl font-bold text-ink">合言葉をどうぞ</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
          aria-label="合言葉"
          className="w-full rounded-lg border-2 border-line bg-washi px-4 py-3 text-lg"
          placeholder="合言葉"
        />
        {error && <p className="text-base text-shu">合言葉が違います</p>}
        <button
          onClick={submit}
          disabled={loading || !password}
          className="min-h-[52px] w-full rounded-lg bg-ai text-lg font-bold text-white disabled:opacity-40"
        >
          入る
        </button>
      </div>
    </main>
  )
}

export default function GatePage() {
  return (
    <Suspense fallback={null}>
      <GateForm />
    </Suspense>
  )
}
