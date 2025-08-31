import { auth } from "./auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;

  const isAuthRoute = nextUrl.pathname.startsWith('/login') || 
                     nextUrl.pathname.startsWith('/register') ||
                     nextUrl.pathname.startsWith('/forgot-password');

  const isProtectedRoute = nextUrl.pathname.startsWith('/questions/add') ||
                          nextUrl.pathname.startsWith('/profile') ||
                          nextUrl.pathname.startsWith('/settings') ||
                          nextUrl.pathname.startsWith('/dashboard');

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL('/', nextUrl.origin));
  }

  // Redirect non-logged-in users away from protected pages
  if (!isLoggedIn && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/',
    '/profile/:path*',
    '/settings/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/questions/add',
    '/dashboard/:path*'
  ]
};
