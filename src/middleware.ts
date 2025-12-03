import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { normalizeRole, isAdminOrManager, isAdmin } from '@/lib/permissions';

// Define protected routes
const protectedRoutes = ['/dashboard', '/admin', '/profile'];
const adminRoutes = ['/dashboard', '/admin']; // Routes that require admin/superuser role
const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password'];

interface TokenPayload {
  exp?: number;
  sub?: string;
  type?: string;
  role?: string;
  is_superuser?: boolean;
}

function decodeToken(token: string): TokenPayload | null {
  try {
    // Basic JWT token structure check
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Decode the payload (second part)
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    // If we can't decode the token, consider it invalid
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload) return true;

  // Check if token has expiry and if it's expired
  if (payload.exp) {
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  }

  // If no expiry, assume it's valid for basic check
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token and user role from cookies
  const token = request.cookies.get('auth-token')?.value;
  const userRole = request.cookies.get('user-role')?.value;

  // Check if token exists and is not expired
  const isAuthenticated = token && !isTokenExpired(token);
  
  // ✅ Check if user has admin OR manager access using permission utility
  const hasManagerOrAdminAccess = isAdminOrManager(userRole);
  
  // ✅ Check if user has admin-only access using permission utility
  const hasAdminOnlyAccess = isAdmin(userRole);

  // Redirect unauthenticated users from protected routes to login
  if (pathname.startsWith('/dashboard') && !isAuthenticated) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);

    const response = NextResponse.redirect(loginUrl);

    if (token && isTokenExpired(token)) {
      response.cookies.set('auth-token', '', {
        path: '/',
        expires: new Date(0),
      });
    }

    return response;
  }

  // ✅ Redirect unauthenticated or non-manager/admin users from dashboard
  if (pathname.startsWith('/dashboard') && (!isAuthenticated || !hasManagerOrAdminAccess)) {
    console.warn('Unauthorized dashboard access attempt:', {
      pathname,
      isAuthenticated,
      userRole,
      hasManagerOrAdminAccess,
    });
    
    const response = NextResponse.redirect(new URL('/exampapers', request.url));
    return response;
  }

  // Redirect non-admin users from admin-only routes
  if (pathname.startsWith('/admin') && isAuthenticated && !hasAdminOnlyAccess) {
    console.warn('Non-admin user attempted to access admin route:', {
      pathname,
      userRole,
    });
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect authenticated users from auth routes to dashboard
  if ((pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register')) && isAuthenticated) {
    const redirectUrl = request.nextUrl.searchParams.get('redirect');
    const targetUrl = redirectUrl && redirectUrl.startsWith('/') && !redirectUrl.startsWith('/auth')
      ? redirectUrl
      : '/dashboard';

    return NextResponse.redirect(new URL(targetUrl, request.url));
  }

  // Add security headers
  const response = NextResponse.next();

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
