import { db } from '@/lib/db';
import { rp } from '@/lib/fmt';
import Badge from '@/components/Badge';
import JenisSelect from '@/components/JenisSelect';
import Kalender from '@/components/Kalender'; // BARU
import { s10, hariIni, jadwalTerdekat, tglPanjang, parse } from '@/lib/jadwal'; // BARU
export const dynamic = 'force-dynamic';
export default async function Dashboard({ searchParams }) {
  const j = searchParams?.jenis || '';
  const [jenis] = await db.query('SELECT id, nama FROM jenis_arisan ORDER BY id');
  const [[a]] = j
    ? await db.query('SELECT COUNT(*) n FROM anggota_jenis WHERE jenis_id=?', [j])
    : await db.query('SELECT COUNT(*) n FROM anggota');
  const [[t]] = await db.query(`SELECT COALESCE(SUM(nominal),0) n, COUNT(*) c FROM pembayaran WHERE status='Lunas' ${j ? 'AND jenis_id=?' : ''}`, j ? [j] : []);
  const [rows] = await db.query(`SELECT p.*, a.nama, jn.nama jenis FROM pembayaran p JOIN anggota a ON a.id=p.anggota_id JOIN jenis_arisan jn ON jn.id=p.jenis_id ${j ? 'WHERE p.jenis_id=?' : ''} ORDER BY p.tanggal DESC, p.id DESC LIMIT 5`, j ? [j] : []);

  // Status arisan: selesai bila semua peserta jenis arisan itu sudah pernah menerima undian
  const ids = j ? [Number(j)] : jenis.map((x) => x.id);
  const hasil = [];
  for (const id of ids) {
    const [[p]] = await db.query('SELECT COUNT(*) n FROM anggota_jenis WHERE jenis_id=?', [id]);
    const [[w]] = await db.query('SELECT COUNT(DISTINCT u.anggota_id) n FROM pengundian u JOIN anggota_jenis aj ON aj.anggota_id=u.anggota_id AND aj.jenis_id=u.jenis_id WHERE u.jenis_id=?', [id]);
    hasil.push({ peserta: p.n, menerima: w.n });
  }
  const aktif = hasil.filter((h) => h.peserta > 0); // arisan tanpa peserta tidak dihitung
  const selesai = aktif.length > 0 && aktif.every((h) => h.menerima >= h.peserta);
  const statusArisan = !aktif.length ? '—' : selesai ? '✅ Selesai' : '🔄 Masih Berjalan';
  const infoArisan = !aktif.length ? 'Belum ada peserta terdaftar'
    : j ? `${aktif[0].menerima} dari ${aktif[0].peserta} peserta sudah menerima`
    : `${aktif.filter((h) => h.menerima >= h.peserta).length} dari ${aktif.length} arisan selesai`;

  // BARU: jadwal arisan, arisan sebelumnya, dan anggota yang belum bayar
  const today = hariIni();
  const ym = /^\d{4}-\d{2}$/.test(searchParams?.bulan || '') ? searchParams.bulan : today.slice(0, 7);
  let jj = [];
  try {
    [jj] = await db.query(`SELECT id, nama, periode, tanggal_mulai FROM jenis_arisan ${j ? 'WHERE id=?' : ''} ORDER BY id`, j ? [j] : []);
  } catch { jj = []; }
  const jadwal = [];
  for (const x of jj) {
    const mulai = s10(x.tanggal_mulai);
    if (!mulai || !['bulanan', 'mingguan'].includes(x.periode)) continue;
    const { sebelumnya, berikutnya } = jadwalTerdekat(mulai, x.periode, today);
    const [belum] = await db.query(
      `SELECT a.nama FROM anggota_jenis aj JOIN anggota a ON a.id=aj.anggota_id
       WHERE aj.jenis_id=? AND NOT EXISTS (
         SELECT 1 FROM pembayaran p WHERE p.anggota_id=aj.anggota_id AND p.jenis_id=aj.jenis_id
         AND p.status='Lunas' AND p.tanggal>=? AND p.tanggal<?) ORDER BY a.nama`,
      [x.id, sebelumnya || '1970-01-01', berikutnya]);
    jadwal.push({
      id: x.id, nama: x.nama, periode: x.periode, mulai, sebelumnya, berikutnya,
      belum: belum.map((b) => b.nama),
      sisa: Math.round((parse(berikutnya) - parse(today)) / 86400000),
    });
  }
  jadwal.sort((p, q) => p.berikutnya.localeCompare(q.berikutnya));

  const stat = [
    ['Jumlah Anggota', a.n, null, 'bg-[#e6cfae]'],
    ['Total Iuran', rp(t.n), null, 'bg-[#dcbb98]'],
    ['Pembayaran Masuk', t.c, null, 'bg-[#d1ab8c]'],
    ['Status Arisan', statusArisan, infoArisan, 'bg-[#c49a78]'],
  ];
  return (
    <section>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mb-4 text-sm text-slate-500">Selamat datang, Admin! Pengelolaan arisan warga.</p>
      <JenisSelect jenis={jenis} value={j} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stat.map(([l, v, sub, c]) => (
          <div key={l} className={`rounded-xl p-4 text-[#2b1a26] ${c}`}>
            <p className="text-xs text-[#2b1a26]/70">{l}</p>
            <p className="text-xl font-bold">{v}</p>
            {sub && <p className="mt-1 text-xs text-[#2b1a26]/70">{sub}</p>}
          </div>
        ))}
      </div>

      {/* BARU: Arisan berikutnya + kalender */}
      <div className="mt-6 grid gap-3 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-4 shadow-sm lg:col-span-2">
          <h2 className="mb-3 font-semibold">Arisan Berikutnya</h2>
          {!jadwal.length && (
            <p className="text-sm text-slate-500">Jadwal belum diatur. Isi kolom periode (bulanan/mingguan) dan tanggal_mulai pada jenis arisan.</p>
          )}
          {jadwal.map((x) => (
            <div key={x.id} className="mb-3 rounded-lg bg-[#e6cfae]/40 p-3 last:mb-0">
              <p className="text-sm font-semibold">
                {x.nama} <span className="text-xs font-normal text-[#2b1a26]/70">({x.periode === 'bulanan' ? 'Per bulan' : 'Per minggu'})</span>
              </p>
              <p className="text-sm">Berikutnya: <b>{tglPanjang(x.berikutnya)}</b> <span className="text-xs">({x.sisa} hari lagi)</span></p>
              <p className="text-sm">Sebelumnya: {x.sebelumnya ? tglPanjang(x.sebelumnya) : 'Belum ada'}</p>
              <p className="mt-2 text-xs font-semibold">Belum bayar iuran periode ini ({x.belum.length}):</p>
              <p className="text-xs">{x.belum.length ? x.belum.join(', ') : 'Semua sudah lunas'}</p>
            </div>
          ))}
        </div>
        <Kalender ym={ym} jadwal={jadwal} jenis={j} />
      </div>

      <h2 className="mb-2 mt-6 font-semibold">Pembayaran Terbaru</h2>
      <Tabel rows={rows} />
    </section>
  );
}
export function Tabel({ rows }) {
  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm"><table className="w-full">
      <thead><tr>{['No', 'Nama Anggota', 'Jenis Arisan', 'Tanggal', 'Nominal', 'Status'].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
      <tbody>{rows.map((r, i) => (
        <tr key={r.id}><td className="td">{i + 1}</td><td className="td">{r.nama}</td><td className="td">{r.jenis}</td><td className="td">{r.tanggal}</td><td className="td">{rp(r.nominal)}</td>
          <td className="td"><Badge s={r.status} /></td></tr>
      ))}{!rows.length && <tr><td className="td text-slate-500" colSpan="6">Belum ada pembayaran.</td></tr>}</tbody>
    </table></div>
  );
}