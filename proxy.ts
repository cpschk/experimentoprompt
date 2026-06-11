import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from './lib/supabase/middleware'

const rateLimit = new Map<string, { count: number; reset: number }>()

const LIMIT = 20
const WINDOW_MS = 60_000

function getRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = rateLimit.get(key)

  if (!entry || now > entry.reset) {
    rateLimit.set(key, { count: 1, reset: now + WINDOW_MS })
    return { allowed: true, remaining: LIMIT - 1 }
  }

  entry.count++
  if (entry.count > LIMIT) {
    return { allowed: false, remaining: 0 }
  }

  return { allowed: true, remaining: LIMIT - entry.count }
}

export async function proxy(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'anonymous'

  const rl = getRateLimit(ip)
  const response = NextResponse.next()

  response.headers.set('X-RateLimit-Limit', String(LIMIT))
  response.headers.set('X-RateLimit-Remaining', String(rl.remaining))
  response.headers.set('X-RateLimit-Reset', String(Math.ceil((rateLimit.get(ip)?.reset || Date.now()) / 1000)))

  if (!rl.allowed) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': String(Math.ceil(WINDOW_MS / 1000)),
        'Content-Type': 'text/plain',
      },
    })
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
