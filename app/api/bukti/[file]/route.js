import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET(_, { params }) {
  const f = params.file;
  if (!/^[\w-]+\.(png|jpg|webp|pdf)$/.test(f)) return new NextResponse('Tidak ditemukan', { status: 404 });
  const s = await getSession();
  if (!s) return new NextResponse('Tidak diizinkan', { status: 401 });
  if (s.role === 'anggota') {
    const [r] = await db.query('SELECT 1 FROM pembayaran WHERE bukti=? AND anggota_id=?', [f, s.anggota_id]);
    if (!r.length) return new NextResponse('Tidak diizinkan', { status: 403 });
  }
  const [[row]] = await db.query('SELECT mime, data FROM bukti_file WHERE nama_file=?', [f]);
  if (!row) return new NextResponse('Tidak ditemukan', { status: 404 });
  return new NextResponse(row.data, { headers: { 'Content-Type': row.mime } });
}