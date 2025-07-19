import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Temporarily disabled middleware to fix black screen issue
  // const res = NextResponse.next()
  // const supabase = createMiddlewareClient({ req, res })
  // await supabase.auth.getSession()
  // return res
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/game/:path*'],
} 