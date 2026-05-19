import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = [
  '/manifest.webmanifest',
  '/manifest.json',
  '/sw.js',
  '/favicon.ico',
  '/icons',
  '/api/push/subscribe',
  '/api/push/send',
  '/connexion',
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Ne jamais bloquer ces chemins publics
  const isPublic = PUBLIC_PATHS.some(path => pathname.startsWith(path));
  if (isPublic) return NextResponse.next();
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
