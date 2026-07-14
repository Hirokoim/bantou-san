import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const GATE_COOKIE = 'demo_access'

export async function middleware(request: NextRequest) {
  // 合言葉ゲート（DEMO_PASSWORD未設定時は無効。/gate・/api/gate自体は対象外）
  const { pathname } = request.nextUrl
  const isGateRoute = pathname === '/gate' || pathname.startsWith('/api/gate')
  if (!isGateRoute && process.env.DEMO_PASSWORD) {
    const cookie = request.cookies.get(GATE_COOKIE)?.value
    if (cookie !== process.env.DEMO_PASSWORD) {
      const url = request.nextUrl.clone()
      url.pathname = '/gate'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // ここでセッション（ログイン状態）を更新する
  await supabase.auth.getUser()
  return response
}

// 画像などの静的ファイルには適用しない設定
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
