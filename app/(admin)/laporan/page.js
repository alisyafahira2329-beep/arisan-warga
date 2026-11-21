import { db } from '@/lib/db';
import { rp } from '@/lib/fmt';
import JenisSelect from '@/components/JenisSelect';
import { Tabel } from '../dashboard/page';
export const dynamic = 'force-dynamic';
export default async function Laporan({ searchParams }) {
  const j = searchParams.jenis || '';
  const w = j ? 'WHERE p.jenis_id=?' : ''; const args = j ? [j] : [];
  const [jenis] = await db.query('SELECT id, nama FROM jenis_arisan ORDER BY id');
  const [[t]] = await db.query(`SELECT COALESCE(SUM(IF(p.status='Lunas',p.nominal,0)),0) total, COUNT(DISTINCT p.anggota_id) n FROM pembayaran p ${w}`, args);
  const [rows] = await db.query(`SELECT p.*, a.nama, jn.nama jenis FROM pembayaran p JOIN anggota a ON a.id=p.anggota_id JOIN jenis_arisan jn ON jn.id=p.jenis_id ${w} ORDER BY p.tanggal DESC`, args);
  const [pen] = await db.query(`SELECT a.nama FROM pengundian u JOIN anggota a ON a.id=u.anggota_id ${j ? 'WHERE u.jenis_id=?' : ''} ORDER BY u.id DESC LIMIT 1`, args);
  return (
    <section>
      <h1 className="text-2xl font-bold">Laporan Arisan</h1>
      <p className="mb-4 text-sm text-slate-500">Lihat laporan dan rekapitulasi arisan.</p>
      <JenisSelect jenis={jenis} value={j} />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {[['Total Pembayaran', rp(t.total), 'bg-[#e6cfae]'], ['Jumlah Anggota', t.n, 'bg-[#dcbb98]'], ['Penerima Arisan', pen[0]?.nama || '—', 'bg-[#d1ab8c]']].map(([l, v, c]) => (
          <div key={l} className={`rounded-xl p-4 text-[#2b1a26] ${c}`}><p className="text-xs text-[#2b1a26]/70">{l}</p><p className="text-xl font-bold">{v}</p></div>))}
      </div>
      <h2 className="mb-2 font-semibold">Detail Laporan</h2>
      <Tabel rows={rows} />
    </section>
  );
}