import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
const err = (m) => NextResponse.json({ error: m }, { status: 400 });
const qid = (r) => new URL(r.url).searchParams.get('id');
const dupe = async (u, aid) => (await db.query('SELECT id FROM users WHERE username=? AND (anggota_id IS NULL OR anggota_id<>?)', [u, aid]))[0].length > 0;
async function akun(aid, b) {
  if (!b.username) return;
  const [[u]] = await db.query('SELECT id FROM users WHERE anggota_id=?', [aid]);
  if (u) {
    await db.query('UPDATE users SET username=? WHERE id=?', [b.username, u.id]);
    if (b.password) await db.query('UPDATE users SET password_hash=? WHERE id=?', [await bcrypt.hash(b.password, 10), u.id]);
  } else if (b.password) {
    await db.query("INSERT INTO users (username,password_hash,role,anggota_id) VALUES (?,?,'anggota',?)", [b.username, await bcrypt.hash(b.password, 10), aid]);
  }
}
async function jenisSync(aid, ids) {
  await db.query('DELETE FROM anggota_jenis WHERE anggota_id=?', [aid]);
  const list = [...new Set((Array.isArray(ids) ? ids : []).map(Number).filter(Boolean))];
  for (const jid of list) await db.query('INSERT INTO anggota_jenis (anggota_id, jenis_id) VALUES (?,?)', [aid, jid]);
}
export async function GET() {
  const [rows] = await db.query(`SELECT a.*, u.username,
    (SELECT GROUP_CONCAT(j.nama ORDER BY j.id SEPARATOR ', ') FROM anggota_jenis aj JOIN jenis_arisan j ON j.id=aj.jenis_id WHERE aj.anggota_id=a.id) jenis_nama,
    (SELECT GROUP_CONCAT(aj.jenis_id) FROM anggota_jenis aj WHERE aj.anggota_id=a.id) jenis_ids
    FROM anggota a LEFT JOIN users u ON u.anggota_id=a.id ORDER BY a.id`);
  return NextResponse.json(rows.map((r) => ({ ...r, jenis_nama: r.jenis_nama || '—', jenis_ids: r.jenis_ids ? r.jenis_ids.split(',') : [] })));
}
export async function POST(req) {
  const b = await req.json();
  if (b.username && !b.password) return err('Isi password untuk akun login anggota.');
  if (b.username && (await dupe(b.username, 0))) return err('Username sudah dipakai.');
  const [r] = await db.query('INSERT INTO anggota (nama, telepon) VALUES (?,?)', [b.nama, b.telepon || null]);
  await akun(r.insertId, b);
  await jenisSync(r.insertId, b.jenis_ids);
  return NextResponse.json({ ok: true });
}
export async function PUT(req) {
  const id = qid(req), b = await req.json();
  if (b.username && (await dupe(b.username, id))) return err('Username sudah dipakai.');
  await db.query('UPDATE anggota SET nama=?, telepon=? WHERE id=?', [b.nama, b.telepon || null, id]);
  await akun(id, b);
  await jenisSync(id, b.jenis_ids);
  return NextResponse.json({ ok: true });
}
export async function DELETE(req) {
  await db.query('DELETE FROM anggota WHERE id=?', [qid(req)]);
  return NextResponse.json({ ok: true });
}
