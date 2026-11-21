import { NextResponse } from 'next/server';
import { verify } from '@/lib/auth';
export async function middleware(req) {
  const { pathname } = req.nextUrl;
  if (pathname === '/login' || pathname === '/api/login') return NextResponse.next();
  const s = await verify(req.cookies.get('token')?.value);
  const api = pathname.startsWith('/api');
  const deny = (to, code) => (api ? NextResponse.json({ error: code === 401 ? 'Belum login' : 'Tidak diizinkan' }, { status: code }) : NextResponse.redirect(new URL(to, req.url)));
  if (!s) return deny('/login', 401);
  if (pathname === '/api/logout' || pathname.startsWith('/api/bukti/')) return NextResponse.next();
  const area = pathname.startsWith('/member') || pathname.startsWith('/api/member');
  if (s.role === 'anggota' && !area) return deny('/member', 403);
  if (s.role !== 'anggota' && area) return deny('/dashboard', 403);
  return NextResponse.next();
}
export const config = { matcher: ['/((?!_next|favicon.ico).*)'] };
