import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
export async function GET() {
  const s = await getSession();
  const [[r]] = await db.query('SELECT a.nama, a.telepon, u.username FROM anggota a LEFT JOIN users u ON u.anggota_id=a.id WHERE a.id=?', [s.anggota_id]);
  return NextResponse.json(r);
}
export async function PUT(req) {
  const s = await getSession(); const b = await req.json();
  if (!b.nama) return NextResponse.json({ error: 'Nama wajib diisi.' }, { status: 400 });
  await db.query('UPDATE anggota SET nama=?, telepon=? WHERE id=?', [b.nama, b.telepon || null, s.anggota_id]);
  if (b.password) await db.query('UPDATE users SET password_hash=? WHERE id=?', [await bcrypt.hash(b.password, 10), s.id]);
  return NextResponse.json({ ok: true });
}
