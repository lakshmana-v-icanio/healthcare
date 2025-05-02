import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Check if the user is authenticated (this is a simple example, you would typically check for a token or session)
  const isAuthenticated = request.cookies.has('auth_token');
  const isAuthPage = request.nextUrl.pathname.startsWith('/signin') || 
                     request.nextUrl.pathname.startsWith('/signup');

  // If trying to access admin pages without authentication, redirect to signin
  if (!isAuthenticated && !isAuthPage && !request.nextUrl.pathname.startsWith('/_next')) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // If already authenticated and trying to access auth pages, redirect to admin dashboard
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};