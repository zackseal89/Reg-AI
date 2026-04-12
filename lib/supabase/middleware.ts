import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Ignore completely paths like API if needed, but for now we apply to all matchers
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

  // Redirect users to login if they aren't authenticated and are trying to access protected routes
  if (!user && !isAuthRoute && request.nextUrl.pathname !== '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user is logged in
  if (user) {
    // If they hit the login or home page, redirect to their role-based dashboard
    if (isAuthRoute || request.nextUrl.pathname === '/') {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      const role = profile?.role || 'client'
      
      const url = request.nextUrl.clone()
      if (role === 'admin') {
        url.pathname = '/admin'
      } else if (role === 'lawyer') {
        url.pathname = '/lawyer'
      } else {
        url.pathname = '/dashboard'
      }
      return NextResponse.redirect(url)
    }

    // Role-based protection
    if (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/lawyer')) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      const role = profile?.role || 'client'
      
      if (request.nextUrl.pathname.startsWith('/admin') && role !== 'admin') {
        const url = request.nextUrl.clone(); url.pathname = '/dashboard'; return NextResponse.redirect(url)
      }
      if (request.nextUrl.pathname.startsWith('/lawyer') && role !== 'lawyer' && role !== 'admin') {
        const url = request.nextUrl.clone(); url.pathname = '/dashboard'; return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
