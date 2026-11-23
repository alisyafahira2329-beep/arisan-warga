import { db } from '@/lib/db';
import { rp } from '@/lib/fmt';
import Badge from '@/components/Badge';
import JenisSelect from '@/components/JenisSelect';
import JadwalBanner from '@/components/JadwalBanner'; // BARU
import { s10, hariIni, jadwalTerdekat, parse } from '@/lib/jadwal'; // BARU
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

  // BARU: jadwal arisan memakai kolom frekuensi (bulanan/mingguan) + tanggal_mulai.
  // Kolom periode tidak disentuh (isinya masa berjalan arisan).
  const today = hariIni();
  let jj = [];
  try {
    [jj] = await db.query(`SELECT id, nama, frekuensi, tanggal_mulai FROM jenis_arisan ${j ? 'WHERE id=?' : ''} ORDER BY id`, j ? [j] : []);
  } catch { jj = []; }
  const jadwal = [];
  for (const x of jj) {
    const mulai = s10(x.tanggal_mulai);
    const f = String(x.frekuensi || '').toLowerCase();
    const per = f.includes('minggu') ? 'mingguan' : f.includes('bulan') ? 'bulanan' : null;
    if (!mulai || !per) continue;
    const { sebelumnya, berikutnya } = jadwalTerdekat(mulai, per, today);
    const [belum] = await db.query(
      `SELECT a.nama FROM anggota_jenis aj JOIN anggota a ON a.id=aj.anggota_id
       WHERE aj.jenis_id=? AND NOT EXISTS (
         SELECT 1 FROM pembayaran p WHERE p.anggota_id=aj.anggota_id AND p.jenis_id=aj.jenis_id
         AND p.status='Lunas' AND p.tanggal>=? AND p.tanggal<?) ORDER BY a.nama`,
      [x.id, sebelumnya || '1970-01-01', berikutnya]);
    let pemenang = null;
    try {
      const [[w]] = await db.query('SELECT a.nama FROM pengundian u JOIN anggota a ON a.id=u.anggota_id WHERE u.jenis_id=? ORDER BY u.id DESC LIMIT 1', [x.id]);
      pemenang = w?.nama || null;
    } catch { pemenang = null; }
    jadwal.push({
      id: x.id, nama: x.nama, periode: per, mulai, sebelumnya, berikutnya, pemenang,
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

      {/* BARU: banner arisan berikutnya + kalender popup */}
      <JadwalBanner jadwal={jadwal} ym={today.slice(0, 7)} />

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