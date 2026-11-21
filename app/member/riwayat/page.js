import { db } from '@/lib/db';
import { rp } from '@/lib/fmt';
import Badge from '@/components/Badge';
import { getSession } from '@/lib/session';
export const dynamic = 'force-dynamic';
export default async function Riwayat() {
  const s = await getSession();
  const [rows] = await db.query('SELECT p.*, j.nama jenis FROM pembayaran p JOIN jenis_arisan j ON j.id=p.jenis_id WHERE p.anggota_id=? ORDER BY p.tanggal DESC, p.id DESC', [s.anggota_id]);
  return (
    <section>
      <h1 className="text-2xl font-bold">Riwayat Pembayaran</h1>
      <p className="mb-4 text-sm text-slate-500">Semua pembayaran iuran Anda.</p>
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm"><table className="w-full">
        <thead><tr>{['No', 'Jenis Arisan', 'Tanggal', 'Nominal', 'Status', 'Bukti'].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => (
          <tr key={r.id}><td className="td">{i + 1}</td><td className="td">{r.jenis}</td><td className="td">{r.tanggal}</td><td className="td">{rp(r.nominal)}</td>
            <td className="td"><Badge s={r.status} /></td>
            <td className="td">{r.bukti ? <a className="text-brand underline" target="_blank" href={'/api/bukti/' + r.bukti}>Lihat</a> : '—'}</td></tr>
        ))}{!rows.length && <tr><td className="td text-slate-500" colSpan="6">Belum ada pembayaran. Kirim bukti bayar lewat menu Upload Bukti Bayar.</td></tr>}</tbody>
      </table></div>
    </section>
  );
}
