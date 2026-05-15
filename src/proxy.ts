import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

const publicRoutes = ['/login', '/register'];

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Allow static files, api routes (if not protected), Next.js internals
  if (path.startsWith('/_next') || path.startsWith('/api') || path.includes('.')) {
    return NextResponse.next();
  }

  const isPublicRoute = publicRoutes.includes(path);
  const token = request.cookies.get('session')?.value;

  // We need to verify the token even in edge runtime. 
  // 'jose' supports edge runtime, so this works.
  const payload = token ? await verifyToken(token) : null;

  // Redirect to login if accessing a protected route without a valid token
  if (!isPublicRoute && !payload) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to bugs if accessing login/register while authenticated
  if (isPublicRoute && payload) {
    return NextResponse.redirect(new URL('/bugs', request.url));
  }
  
  // Redirect root to bugs
  if (path === '/') {
    return NextResponse.redirect(new URL('/bugs', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
