import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

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
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthRoute = request.nextUrl.pathname.startsWith('/login')
  const pathname = request.nextUrl.pathname

  // Redirect unauthenticated users to login
  if (!user && !isAuthRoute && pathname !== '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user is logged in — fetch profile once and reuse
  if (user) {
    const needsProfile =
      isAuthRoute ||
      pathname === '/' ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/lawyer')

    if (needsProfile) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      const role = profile?.role || 'client'

      // Redirect from login/home to role dashboard
      if (isAuthRoute || pathname === '/') {
        const url = request.nextUrl.clone()
        url.pathname = role === 'admin' ? '/admin' : role === 'lawyer' ? '/lawyer' : '/dashboard'
        return NextResponse.redirect(url)
      }

      // Role-based protection for /admin and /lawyer
      if (pathname.startsWith('/admin') && role !== 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }
      if (pathname.startsWith('/lawyer') && role !== 'lawyer' && role !== 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
