'use client';
import { useState } from 'react';
export default function UploadForm({ jenis }) {
  const [j, setJ] = useState(jenis[0]?.id || ''); const [file, setFile] = useState(null); const [msg, setMsg] = useState(null);
  async function kirim(e) {
    e.preventDefault(); setMsg(null);
    if (!file) return setMsg({ t: 'Pilih file bukti bayar dulu.' });
    const fd = new FormData(); fd.append('jenis_id', j); fd.append('file', file);
    const r = await fetch('/api/member/bukti', { method: 'POST', body: fd });
    const x = await r.json().catch(() => ({}));
    if (r.ok) { setMsg({ ok: 1, t: 'Bukti terkirim. Admin akan memeriksa pembayaran Anda.' }); setFile(null); } else setMsg({ t: x.error || 'Gagal mengirim bukti.' });
  }
  return (
    <form onSubmit={kirim} className="space-y-3 rounded-xl bg-white p-5 shadow-sm">
      <label className="block text-sm">Jenis Arisan
        <select className="inp mt-1" value={j} onChange={(e) => setJ(e.target.value)}>{jenis.map((x) => <option key={x.id} value={x.id}>{x.nama}</option>)}</select>
      </label>
      <label onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); setFile(e.dataTransfer.files[0]); }}
        className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border-2 border-dashed border-indigo-300 p-6 text-center text-sm text-slate-600 hover:bg-indigo-50">
        <span className="text-3xl">☁️</span>
        {file ? <b>{file.name}</b> : 'Klik untuk mengunggah atau seret file di sini'}
        <span className="text-xs text-slate-400">PNG, JPG, WEBP, atau PDF · maks. 2 MB</span>
        <input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" className="sr-only" onChange={(e) => setFile(e.target.files[0] || null)} />
      </label>
      {msg && <p role="status" className={`rounded p-2 text-sm ${msg.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msg.t}</p>}
      <button className="btn w-full">Kirim Bukti Bayar</button>
    </form>
  );
}
