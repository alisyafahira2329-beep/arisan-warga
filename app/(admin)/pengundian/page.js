'use client';
import { useEffect, useState } from 'react';
export default function Pengundian() {
  const [jenis, setJenis] = useState([]); const [j, setJ] = useState('');
  const [d, setD] = useState({ belum: [], hasil: [] }); const [win, setWin] = useState(''); const [err, setErr] = useState('');
  useEffect(() => { fetch('/api/jenis').then((r) => r.json()).then(setJenis); }, []);
  const load = () => fetch('/api/undian?jenis=' + j).then((r) => r.json()).then(setD);
  useEffect(() => { setWin(''); setErr(''); load(); }, [j]);
  async function undi() {
    setErr('');
    const r = await fetch('/api/undian', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jenis_id: j }) });
    const x = await r.json(); r.ok ? setWin(x.pemenang) : setErr(x.error); load();
  }
  return (
    <section>
      <h1 className="text-2xl font-bold">Pengundian Arisan</h1>
      <p className="mb-4 text-sm text-slate-500">Kelola peserta dan lakukan pengundian.</p>
      <label className="mb-4 flex items-center gap-2 whitespace-nowrap text-sm">Jenis Arisan:
        <select className="inp" style={{ width: '16rem', maxWidth: '100%' }} value={j} onChange={(e) => setJ(e.target.value)}>
          <option value="">Semua Jenis</option>
          {jenis.map((x) => <option key={x.id} value={x.id}>{x.nama}</option>)}
        </select>
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-[#e6cfae] p-5 text-[#2b1a26]">
          <h2 className="font-semibold text-[#5b2a4e]">Anggota yang belum dapat arisan</h2>
          <ol className="mt-2 list-decimal pl-5 text-sm">{d.belum.map((a) => <li key={a.id}>{a.nama}</li>)}</ol>
          {!d.belum.length && <p className="mt-2 text-sm text-[#2b1a26]/70">Semua anggota sudah mendapat giliran.</p>}
          <button className="btn mt-4" onClick={undi} disabled={!j || !d.belum.length}>Lakukan Pengundian</button>
          {!j && <p className="mt-2 text-xs text-[#2b1a26]/70">Pilih jenis arisan untuk melakukan pengundian.</p>}
        </div>
        <div className="rounded-xl bg-[#dcbb98] p-5 text-center text-[#2b1a26]">
          <h2 className="font-semibold text-[#5b2a4e]">Hasil undian</h2>
          <p className="mt-3 text-sm">Penerima Arisan</p>
          <p className="text-3xl font-bold">{win || d.hasil[0]?.nama || '—'}</p>
          <div className="text-5xl">🏆</div>
          {err && <p role="alert" className="mt-2 text-sm text-[#9f1239]">{err}</p>}
        </div>
      </div>
    </section>
  );
}