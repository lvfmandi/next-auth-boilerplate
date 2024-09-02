/* 
        The middleware performs optimistic checks to protects the routes including static pages because it runs on every request.
        WE therefore ONLY CHECK THE COOKIE AND NOT THE DATABASE TO AVOID PERFOMANCE ISSUES
        It is our first layer of security, we have others
*/
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// libs
import { authRoutes, protectedRoutes, adminRoutes } from '@/lib/routes';
import { decrypt } from '@/lib/session';
import { TokenPayload } from '@/lib/definitions';

// middleware
const middleware = async (req: NextRequest) => {
  const path = req.nextUrl.pathname;

  const isAuthRoute = authRoutes.includes(path);
  const isAdminRoute = adminRoutes.includes(path);
  const isProtectedRoute = protectedRoutes.includes(path);

  //   Verify the session
  const refresh_token = cookies().get('r_id')?.value;
  const userData = (await decrypt(refresh_token)) as TokenPayload | null;

  //   Redirect to login if the user isn't authenticated and is trying to access the logged in routes
  if ((isProtectedRoute || isAdminRoute) && !userData) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  //   Redirect to dashboard if the user isn't an admin and is trying to access admin routes
  if (isAdminRoute && userData?.userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  //    Redirect the user to dashboard if they are authenticated
  if (
    isAuthRoute &&
    userData?.userId &&
    !req.nextUrl.pathname.startsWith('/dashboard')
  ) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }

  //    Redirect the user to the admin if they are authenticated and are an ADMIN
  if (
    isAuthRoute &&
    userData?.userRole === 'ADMIN' &&
    !req.nextUrl.pathname.startsWith('/admin')
  ) {
    return NextResponse.redirect(new URL('/admin', req.nextUrl));
  }

  return NextResponse.next();
};

// Routes the middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};

export default middleware;
