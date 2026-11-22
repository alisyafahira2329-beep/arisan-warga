import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
const EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'application/pdf': 'pdf' };
const err = (m) => NextResponse.json({ error: m }, { status: 400 });
export async function POST(req) {
  const s = await getSession(); const fd = await req.formData(); const file = fd.get('file');
  const ext = file && EXT[file.type];
  if (!ext) return err('Format file harus PNG, JPG, WEBP, atau PDF.');
  if (file.size > 2 * 1024 * 1024) return err('Ukuran file maksimal 2 MB.');
  const [[j]] = await db.query('SELECT * FROM jenis_arisan WHERE id=?', [fd.get('jenis_id')]);
  if (!j) return err('Pilih jenis arisan.');
  const name = crypto.randomUUID() + '.' + ext;
await db.query(
  'INSERT INTO bukti_file (nama_file, mime, data) VALUES (?,?,?)',
  [name, file.type, Buffer.from(await file.arrayBuffer())]
);
  await db.query("INSERT INTO pembayaran (anggota_id,jenis_id,nominal,tanggal,status,bukti) VALUES (?,?,?,CURDATE(),'Menunggu',?)", [s.anggota_id, j.id, j.nominal, name]);
  return NextResponse.json({ ok: true });
}
