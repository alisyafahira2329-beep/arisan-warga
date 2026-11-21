import { NextResponse } from 'next/server';
import { randomInt } from 'node:crypto';
import { db } from '@/lib/db';
// Peserta = anggota yang terdaftar di jenis arisan tsb (tabel anggota_jenis) dan belum pernah menang di jenis itu
const eligible = (j) => db.query(
  `SELECT a.* FROM anggota a JOIN anggota_jenis aj ON aj.anggota_id=a.id
   WHERE aj.jenis_id=? AND a.id NOT IN (SELECT anggota_id FROM pengundian WHERE jenis_id=?) ORDER BY a.nama`, [j, j]).then(([r]) => r);
export async function GET(req) {
  const j = new URL(req.url).searchParams.get('jenis');
  if (!j) {
    const [belum] = await db.query(
      `SELECT a.* FROM anggota a WHERE EXISTS (
         SELECT 1 FROM anggota_jenis aj WHERE aj.anggota_id=a.id
         AND NOT EXISTS (SELECT 1 FROM pengundian u WHERE u.anggota_id=a.id AND u.jenis_id=aj.jenis_id)
       ) ORDER BY a.nama`);
    const [hasil] = await db.query('SELECT u.tanggal, a.nama FROM pengundian u JOIN anggota a ON a.id=u.anggota_id ORDER BY u.id DESC');
    return NextResponse.json({ belum, hasil });
  }
  const [hasil] = await db.query('SELECT u.tanggal, a.nama FROM pengundian u JOIN anggota a ON a.id=u.anggota_id WHERE u.jenis_id=? ORDER BY u.id DESC', [j]);
  return NextResponse.json({ belum: await eligible(j), hasil });
}
export async function POST(req) {
  const { jenis_id } = await req.json();
  if (!jenis_id) return NextResponse.json({ error: 'Pilih jenis arisan terlebih dahulu.' }, { status: 400 });
  const [[{ n }]] = await db.query('SELECT COUNT(*) n FROM anggota_jenis WHERE jenis_id=?', [jenis_id]);
  if (!n) return NextResponse.json({ error: 'Belum ada anggota yang terdaftar di arisan ini.' }, { status: 400 });
  const belum = await eligible(jenis_id);
  if (!belum.length) return NextResponse.json({ error: 'Semua anggota sudah pernah menang.' }, { status: 400 });
  const w = belum[randomInt(0, belum.length)]; // acak setiap kali undi, dari semua peserta yang tersisa
  await db.query('INSERT INTO pengundian (jenis_id, anggota_id, tanggal) VALUES (?,?,CURDATE())', [jenis_id, w.id]);
  return NextResponse.json({ pemenang: w.nama });
}
