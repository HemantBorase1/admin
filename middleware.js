import { NextResponse } from 'next/server'

export function middleware(request) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define protected routes (admin routes that require authentication)
  const protectedRoutes = [
    '/dashboard',
    '/farmers',
    '/vendors',
    '/organic-products',
    '/banners',
    '/news'
  ]

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))

  if (isProtectedRoute) {
    // Get the session token from cookies
    const sessionToken = request.cookies.get('admin_session')?.value

    // If no session token, redirect to login
    if (!sessionToken) {
      const loginUrl = new URL('/', request.url)
      return NextResponse.redirect(loginUrl)
    }

    // Validate session token (optional - can be done on the client side)
    // For now, just check if it exists and has the right format
    if (!sessionToken.startsWith('admin_session_')) {
      const loginUrl = new URL('/', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // If it's the login page and user is already authenticated, redirect to dashboard
  if (path === '/' || path === '/login') {
    const sessionToken = request.cookies.get('admin_session')?.value
    
    if (sessionToken && sessionToken.startsWith('admin_session_')) {
      const dashboardUrl = new URL('/dashboard', request.url)
      return NextResponse.redirect(dashboardUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 