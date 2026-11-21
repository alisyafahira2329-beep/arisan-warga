import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
const TYPE = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp', pdf: 'application/pdf' };
export async function GET(_, { params }) {
  const f = params.file;
  if (!/^[\w-]+\.(png|jpg|webp|pdf)$/.test(f)) return new NextResponse('Tidak ditemukan', { status: 404 });
  const s = await getSession();
  if (s.role === 'anggota') {
    const [r] = await db.query('SELECT 1 FROM pembayaran WHERE bukti=? AND anggota_id=?', [f, s.anggota_id]);
    if (!r.length) return new NextResponse('Tidak diizinkan', { status: 403 });
  }
  try {
    const buf = await readFile(path.join(process.cwd(), 'uploads', f));
    return new NextResponse(buf, { headers: { 'Content-Type': TYPE[f.split('.')[1]] } });
  } catch { return new NextResponse('Tidak ditemukan', { status: 404 }); }
}
