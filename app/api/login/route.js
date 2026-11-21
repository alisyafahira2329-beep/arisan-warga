import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { sign } from '@/lib/auth';
export async function POST(req) {
  try {
    const { username, password } = await req.json();
    const [rows] = await db.query('SELECT * FROM users WHERE username=?', [username || '']);
    const u = rows[0];
    if (!u || !(await bcrypt.compare(password || '', u.password_hash)))
      return NextResponse.json({ error: 'Username atau password salah.' }, { status: 401 });
    const res = NextResponse.json({ ok: true, role: u.role });
    res.cookies.set('token', await sign({ id: u.id, role: u.role, anggota_id: u.anggota_id }), {
      httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 28800,
    });
    return res;
  } catch (e) {
    console.error('Login error:', e);
    return NextResponse.json({ error: 'Server tidak bisa terhubung ke database. Periksa MySQL dan .env.local.' }, { status: 500 });
  }
}
