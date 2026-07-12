'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function LoginPanel({ onLogin }: { onLogin: () => void }) {
  return (
    <>
      <p className="text-base text-ink">さくら台マンション管理組合</p>
      <h1 className="font-display text-[32px] font-extrabold text-ink">番頭さん</h1>
      <p className="text-lg text-ink">マンションのこと、何なりとお申し付けください</p>

      <button
        onClick={onLogin}
        className="mt-4 flex min-h-[60px] w-full max-w-sm items-center justify-center gap-3 rounded-lg bg-ai text-lg font-bold text-white"
      >
        <GoogleIcon />
        Googleでつづける
      </button>
    </>
  )
}

function HeroWithOverlay({
  src, onLogin, panelMarginBottom, panelMaxWidth,
}: {
  src: string
  onLogin: () => void
  panelMarginBottom: string
  panelMaxWidth: string
}) {
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <div className="relative flex min-h-screen items-end justify-center bg-washi">
      {!imgFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          onError={() => setImgFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-ink text-4xl font-display font-extrabold text-ink">
            番
          </div>
        </div>
      )}
      <div
        className={`relative flex w-full flex-col items-center gap-3 rounded-2xl bg-washi/95 px-8 py-8 text-center shadow-lg ${panelMarginBottom} ${panelMaxWidth}`}
      >
        <LoginPanel onLogin={onLogin} />
      </div>
    </div>
  )
}

export default function LoginPage() {
  const supabase = createClient()

  const login = () => supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${location.origin}/auth/callback` },
  })

  return (
    <main className="min-h-screen">
      <div className="md:hidden">
        <HeroWithOverlay
          src="/images/login-hero.png"
          onLogin={login}
          panelMarginBottom="mb-[14%]"
          panelMaxWidth="max-w-sm mx-6"
        />
      </div>
      <div className="hidden md:block">
        <HeroWithOverlay
          src="/images/login-hero-desktop.png"
          onLogin={login}
          panelMarginBottom="mb-[6%]"
          panelMaxWidth="max-w-md"
        />
      </div>
    </main>
  )
}
