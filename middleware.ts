import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Защищенные маршруты
  const protectedPaths = ['/enhanced-map', '/duel'];
  const authPaths = ['/auth/login', '/auth/register'];
  
  const isProtectedPath = protectedPaths.some(path => 
    req.nextUrl.pathname === path || req.nextUrl.pathname.startsWith(path + '/')
  );
  
  const isAuthPath = authPaths.some(path => req.nextUrl.pathname.startsWith(path));

  // Если пользователь не авторизован и пытается попасть на защищенную страницу
  if (!session && isProtectedPath) {
    const redirectUrl = new URL('/auth/login', req.url);
    redirectUrl.searchParams.set('redirect', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Если пользователь авторизован и пытается попасть на страницу входа/регистрации
  if (session && isAuthPath) {
    const redirect = req.nextUrl.searchParams.get('redirect') || '/';
    return NextResponse.redirect(new URL(redirect, req.url));
  }

  return res;
}

export const config = {
  matcher: ['/', '/enhanced-map', '/auth/:path*'],
};
