import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { R } from '@/lib/resources';
const cfg = (p) => R[p.res];
const vals = (c, b) => c.fields.map((f) => (b[f] === '' ? null : b[f]));
export async function GET(_, { params }) {
  const c = cfg(params); if (!c) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 });
  const [rows] = await db.query(c.list); return NextResponse.json(rows);
}
export async function POST(req, { params }) {
  const c = cfg(params); if (!c) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 });
  const b = await req.json();
  await db.query(`INSERT INTO ${c.table} (${c.fields.join(',')}) VALUES (${c.fields.map(() => '?').join(',')})`, vals(c, b));
  return NextResponse.json({ ok: true });
}
export async function PUT(req, { params }) {
  const c = cfg(params); const id = new URL(req.url).searchParams.get('id');
  const b = await req.json();
  await db.query(`UPDATE ${c.table} SET ${c.fields.map((f) => f + '=?').join(',')} WHERE id=?`, [...vals(c, b), id]);
  return NextResponse.json({ ok: true });
}
export async function DELETE(req, { params }) {
  const c = cfg(params); const id = new URL(req.url).searchParams.get('id');
  await db.query(`DELETE FROM ${c.table} WHERE id=?`, [id]);
  return NextResponse.json({ ok: true });
}
