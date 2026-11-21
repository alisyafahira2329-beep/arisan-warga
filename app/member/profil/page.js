'use client';
import { useEffect, useState } from 'react';
export default function Profil() {
  const [f, setF] = useState({ nama: '', telepon: '', username: '', password: '' }); const [msg, setMsg] = useState(null);
  useEffect(() => { fetch('/api/member/profil').then((r) => r.json()).then((d) => setF({ ...d, telepon: d.telepon || '', password: '' })); }, []);
  async function save(e) {
    e.preventDefault(); setMsg(null);
    const r = await fetch('/api/member/profil', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
    const x = await r.json().catch(() => ({}));
    setMsg(r.ok ? { ok: 1, t: 'Profil disimpan.' } : { t: x.error || 'Gagal menyimpan.' }); setF((o) => ({ ...o, password: '' }));
  }
  return (
    <section className="max-w-md">
      <h1 className="text-2xl font-bold">Edit Profil</h1>
      <p className="mb-4 text-sm text-slate-500">Perbarui data diri dan password Anda.</p>
      <form onSubmit={save} className="space-y-3 rounded-xl bg-white p-5 shadow-sm">
        <label className="block text-sm">Username<input className="inp mt-1 bg-slate-100" value={f.username || ''} disabled /></label>
        <label className="block text-sm">Nama<input className="inp mt-1" required value={f.nama} onChange={(e) => setF({ ...f, nama: e.target.value })} /></label>
        <label className="block text-sm">Nomor Telepon<input className="inp mt-1" value={f.telepon} onChange={(e) => setF({ ...f, telepon: e.target.value })} /></label>
        <label className="block text-sm">Password baru (kosongkan jika tidak diubah)<input type="password" autoComplete="new-password" className="inp mt-1" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></label>
        {msg && <p role="status" className={`rounded p-2 text-sm ${msg.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msg.t}</p>}
        <button className="btn">Simpan perubahan</button>
      </form>
    </section>
  );
}
