import { NextResponse } from 'next/server'

const GATE_COOKIE = 'demo_access'

export async function POST(request: Request) {
  const { password } = await request.json()

  if (!process.env.DEMO_PASSWORD || password !== process.env.DEMO_PASSWORD) {
    return NextResponse.json({ error: 'invalid' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(GATE_COOKIE, password, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
  return response
}
