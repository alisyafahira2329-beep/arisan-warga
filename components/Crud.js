'use client';
import { useEffect, useState } from 'react';
import { rp } from '@/lib/fmt';
import Badge from '@/components/Badge';

const BLN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const bt = (s) => { const [y, m] = String(s).slice(0, 10).split('-'); return `${BLN[Number(m) - 1]} ${y}`; };
// teks "masa berjalan" untuk kolom periode, dibuat otomatis dari tanggal mulai-selesai
const labelPeriode = (f) => (f.tanggal_mulai ? `${bt(f.tanggal_mulai)}-${f.tanggal_selesai ? bt(f.tanggal_selesai) : 'Berkelanjutan'}` : f.periode || '');

export default function Crud({ title, desc, res, cols, addLabel, filterJenis, formTitle, formDesc, formNote }) {
  const [rows, setRows] = useState([]); const [opts, setOpts] = useState({});
  const [f, setF] = useState(null); const [jf, setJf] = useState('');
  const load = () => fetch('/api/' + res).then((r) => r.json()).then(setRows);
  useEffect(() => {
    load();
    [...new Set([...cols.filter((c) => c.from).map((c) => c.from), ...((filterJenis || cols.some((c) => c.multi)) ? ['jenis'] : [])])]
      .forEach((k) => fetch('/api/' + k).then((r) => r.json()).then((d) => setOpts((o) => ({ ...o, [k]: d }))));
  }, []);
  const save = async (e) => {
    e.preventDefault();
    const body = { ...f };
    cols.forEach((c) => { if (c.type === 'date') body[c.key] = body[c.key] ? String(body[c.key]).slice(0, 10) : null; });
    if (body.tanggal_mulai && body.tanggal_selesai && body.tanggal_selesai < body.tanggal_mulai) return alert('Tanggal selesai tidak boleh sebelum tanggal mulai.');
    if (res === 'jenis') body.periode = labelPeriode(body);
    const r = await fetch('/api/' + res + (f.id ? '?id=' + f.id : ''), { method: f.id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!r.ok) return alert((await r.json()).error || 'Gagal menyimpan.');
    setF(null); load();
  };
  const del = async (id) => { if (confirm('Hapus data ini?')) { await fetch(`/api/${res}?id=${id}`, { method: 'DELETE' }); load(); } };
  const cocok = (r) => !jf || (Array.isArray(r.jenis_ids) ? r.jenis_ids.map(String).includes(jf) : String(r.jenis_id) === jf);
  const shown = Array.isArray(rows) ? rows.filter(cocok) : [];
  const cell = (r, c) => {
    if (c.type === 'money') return rp(r[c.key]);
    if (c.key === 'status') return <Badge s={r.status} />;
    if (c.key === 'bukti') return r.bukti ? <a className="text-brand underline" href={'/api/bukti/' + r.bukti} target="_blank">Lihat</a> : '—';
    if (c.type === 'date') return r[c.key] ? String(r[c.key]).slice(0, 10) : '—';
    return r[c.show || c.key];
  };
  return (
    <section>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div><h1 className="text-2xl font-bold">{title}</h1><p className="text-sm text-slate-500">{desc}</p></div>
        <button className="btn" onClick={() => setF(Object.fromEntries(cols.map((c) => [c.key, c.def ?? ''])))}>+ {addLabel}</button>
      </div>
      {(filterJenis || cols.some((c) => c.multi)) && (
        <label className="mb-4 flex items-center gap-2 whitespace-nowrap text-sm">Jenis Arisan:
          <select className="inp" style={{ width: '16rem', maxWidth: '100%' }} value={jf} onChange={(e) => setJf(e.target.value)}>
            <option value="">Semua Jenis</option>{(opts.jenis || []).map((j) => <option key={j.id} value={j.id}>{j.nama}</option>)}
          </select>
        </label>
      )}
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full">
          <thead><tr><th className="th">No</th>{cols.filter((c) => !c.hide).map((c) => <th key={c.key} className="th">{c.short || c.label}</th>)}
          <tbody>
            {shown.map((r, i) => (
              <tr key={r.id}><td className="td">{i + 1}</td>{cols.filter((c) => !c.hide).map((c) => <td key={c.key} className="td">{cell(r, c)}</td>)}
                <td className="td space-x-1 whitespace-nowrap">
                  <button className="rounded bg-blue-500 px-2 py-1 text-xs text-white" onClick={() => setF({ ...r })}>Edit</button>
                  <button className="rounded bg-red-400 px-2 py-1 text-xs text-white" onClick={() => del(r.id)}>Hapus</button>
                </td></tr>
            ))}
            {!shown.length && <tr><td className="td text-slate-500" colSpan={cols.length + 2}>{jf ? 'Belum ada data untuk jenis arisan ini.' : <>Belum ada data. Klik “{addLabel}” untuk mulai.</>}</td></tr>}
          </tbody>
        </table>
      </div>
      {f && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={save} className={`max-h-[90vh] w-full ${formTitle ? 'max-w-lg' : 'max-w-md'} space-y-3 overflow-y-auto rounded-xl bg-white p-6`}>
            <div>
              <h2 className="text-lg font-bold">{f.id ? 'Edit' : 'Tambah'} {formTitle || 'data'}</h2>
              {formDesc && <p className="text-sm text-slate-500">{formDesc}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {cols.filter((c) => !c.view).map((c) => c.multi ? (
                <fieldset key={c.key} className="col-span-2 text-sm">{c.label}
                  <div className="mt-1 space-y-1 rounded-md border border-slate-300 p-3">
                    {(opts[c.from] || []).map((o) => (
                      <label key={o.id} className="flex items-center gap-2">
                        <input type="checkbox" checked={(f[c.key] || []).map(String).includes(String(o.id))}
                          onChange={(e) => { const cur = (f[c.key] || []).map(String); setF({ ...f, [c.key]: e.target.checked ? [...cur, String(o.id)] : cur.filter((x) => x !== String(o.id)) }); }} />
                        {o.nama}
                      </label>
                    ))}
                    {!(opts[c.from] || []).length && <p className="text-slate-500">Belum ada jenis arisan.</p>}
                  </div>
                </fieldset>
              ) : c.type === 'cards' ? (
                <fieldset key={c.key} className="col-span-2 text-sm">{c.label}
                  <div className="mt-1 grid grid-cols-2 gap-3">
                    {c.cards.map((o) => {
                      const on = f[c.key] === o.value;
                      return (
                        <label key={o.value} className={`cursor-pointer rounded-lg border p-3 ${on ? 'border-brand bg-beige' : 'border-slate-300 bg-white'}`}>
                          <input type="radio" name={c.key} required className="sr-only" checked={on} onChange={() => setF({ ...f, [c.key]: o.value })} />
                          <span className="flex items-center justify-between gap-2">
                            <span className="font-semibold">{o.label}</span>
                            <span className={on ? 'font-bold text-brand' : 'text-slate-400'}>{on ? '✔' : '○'}</span>
                          </span>
                          <span className="block text-xs text-slate-500">{o.sub}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ) : (
                <label key={c.key} className={`block text-sm ${c.half ? '' : 'col-span-2'}`}>{c.label}
                  {c.from || c.opts ? (
                    <select className="inp mt-1" required value={f[c.key]} onChange={(e) => setF({ ...f, [c.key]: e.target.value })}>
                      <option value="">Pilih…</option>
                      {c.from ? (opts[c.from] || []).map((o) => <option key={o.id} value={o.id}>{o.nama}</option>) : c.opts.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input className="inp mt-1" required={!c.optional} placeholder={c.placeholder} type={c.type === 'money' ? 'number' : c.type || 'text'}
                      value={c.type === 'date' ? String(f[c.key] ?? '').slice(0, 10) : f[c.key] ?? ''} onChange={(e) => setF({ ...f, [c.key]: e.target.value })} />
                  )}
                </label>
              ))}
            </div>
            {formNote && <p className="rounded-md bg-beige px-3 py-2 text-xs text-slate-600">ⓘ {formNote}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="rounded-md px-4 py-2 text-sm hover:bg-slate-100" onClick={() => setF(null)}>Batal</button>
              <button className="btn">Simpan</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}