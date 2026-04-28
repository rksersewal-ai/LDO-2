import { NextRequest, NextResponse } from 'next/server'

const PUBLIC = ['/login']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('ldo_token')?.value
  const isPublic = PUBLIC.some((r) => pathname.startsWith(r))

  if (isPublic && token) return NextResponse.redirect(new URL('/', request.url))
  if (!isPublic && !token) {
    const url = new URL('/login', request.url)
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
