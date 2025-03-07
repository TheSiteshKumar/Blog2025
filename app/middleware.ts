import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware handles the root-level blog post URLs
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for these paths
  const skipPaths = [
    '/api/',
    '/_next/',
    '/favicon.ico',
    '/blog',
    '/auth',
    '/dashboard',
    '/static',
    '/images',
    '/assets',
  ];
  
  // Check if the path should be skipped
  if (skipPaths.some(path => pathname.startsWith(path)) || pathname === '/') {
    return NextResponse.next();
  }

  // For all other paths, let the [slug] page handle it
  return NextResponse.next();
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
};