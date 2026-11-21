'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export default function Login() {
  const [f, setF] = useState({ username: '', password: '' });
  const [err, setErr] = useState('');
  const router = useRouter();
  async function submit(e) {
    e.preventDefault(); setErr('');
    const r = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
    const x = await r.json().catch(() => ({}));
    if (r.ok) { router.push(x.role === 'anggota' ? '/member' : '/dashboard'); router.refresh(); }
    else setErr(x.error || 'Terjadi kesalahan di server.');
  }
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="grid w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-lg md:grid-cols-2">
        <div className="flex flex-col items-center justify-center gap-2 bg-[#efe3d0] p-10 text-center">
          <div className="text-6xl">🏠</div>
          <h1 className="text-2xl font-bold text-[#5b2a4e]">Arisan Warga</h1>
          <p className="text-sm text-[#451d3b]">Arisan lebih mudah dan terpercaya</p>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-4 p-8">
          <div><h2 className="text-xl font-bold">Masuk</h2><p className="text-sm text-slate-500">Silakan login untuk melanjutkan</p></div>
          <label className="text-sm">Username<input className="inp mt-1" placeholder="Masukkan username" value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} required /></label>
          <label className="text-sm">Password<input type="password" className="inp mt-1" placeholder="Masukkan password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required /></label>
          {err && <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">{err}</p>}
          <button className="btn">Login</button>
        </form>
      </div>
    </main>
  );
}
