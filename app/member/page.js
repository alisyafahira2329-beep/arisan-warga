import Link from 'next/link';
import JenisSelect from '@/components/JenisSelect';
import JadwalBanner from '@/components/JadwalBanner'; // BARU
import { ambilJadwal } from '@/lib/ambilJadwal'; // BARU
import { hariIni } from '@/lib/jadwal'; // BARU
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
export const dynamic = 'force-dynamic';

// Awal periode berjalan: Mingguan = Senin minggu ini, Bulanan = tanggal 1 bulan ini, Tahunan = 1 Januari
const now = () => new Date();
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
function awalPeriode(periode) {
  const p = (periode || '').toLowerCase(); const n = now();
  if (p.includes('minggu')) { const d = new Date(n.getFullYear(), n.getMonth(), n.getDate()); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return iso(d); }
  if (p.includes('bulan')) return iso(new Date(n.getFullYear(), n.getMonth(), 1));
  if (p.includes('tahun')) return iso(new Date(n.getFullYear(), 0, 1));
  return null;
}
function labelPeriode(periode) {
  const p = (periode || '').toLowerCase(); const n = now();
  if (p.includes('minggu')) return 'minggu ini';
  if (p.includes('bulan')) return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(n);
  if (p.includes('tahun')) return `tahun ${n.getFullYear()}`;
  return 'periode berjalan';
}
// BARU: frekuensi (Bulanan/Mingguan dari formulir Jenis Arisan) diutamakan, periode lama jadi cadangan
const frek = (x) => x?.frekuensi || x?.periode;
// Status pembayaran anggota untuk satu jenis arisan pada periode berjalan (Lunas diprioritaskan)
async function statusJenis(anggotaId, jenisId, periode) {
  const start = awalPeriode(periode);
  const [r] = await db.query(
    `SELECT status FROM pembayaran WHERE anggota_id=? AND jenis_id=? ${start ? 'AND tanggal>=?' : ''} ORDER BY (status='Lunas') DESC, tanggal DESC, id DESC LIMIT 1`,
    start ? [anggotaId, jenisId, start] : [anggotaId, jenisId]);
  return r[0]?.status || null;
}

export default async function MemberDashboard({ searchParams }) {
  const s = await getSession(); const j = searchParams.jenis || '';
  let [jenis] = await db.query('SELECT j.id, j.nama, j.periode, j.frekuensi FROM jenis_arisan j JOIN anggota_jenis aj ON aj.jenis_id=j.id WHERE aj.anggota_id=? ORDER BY j.id', [s.anggota_id]);
  const ikut = jenis.length > 0; // BARU: apakah anggota terdaftar di jenis arisan tertentu
  if (!jenis.length) [jenis] = await db.query('SELECT id, nama, periode, frekuensi FROM jenis_arisan ORDER BY id');
  const [[a]] = await db.query('SELECT nama FROM anggota WHERE id=?', [s.anggota_id]);
  const [pen] = await db.query(`SELECT a.nama FROM pengundian u JOIN anggota a ON a.id=u.anggota_id ${j ? 'WHERE u.jenis_id=?' : ''} ORDER BY u.id DESC LIMIT 1`, j ? [j] : []);

  // Status pembayaran per periode (mingguan/bulanan) dan reset otomatis tiap periode baru
  let status, subStatus;
  if (j) {
    const item = jenis.find((x) => String(x.id) === String(j));
    const st = await statusJenis(s.anggota_id, j, frek(item));
    status = st === 'Lunas' ? 'Lunas' : st === 'Menunggu' ? 'Menunggu verifikasi' : st === 'Belum Lunas' ? 'Belum Lunas' : 'Belum bayar';
    subStatus = `Periode ${frek(item) || '-'} · ${labelPeriode(frek(item))}`;
  } else {
    let lunas = 0;
    for (const x of jenis) if ((await statusJenis(s.anggota_id, x.id, frek(x))) === 'Lunas') lunas++;
    status = jenis.length ? `${lunas} dari ${jenis.length} arisan lunas` : 'Belum ada arisan';
    subStatus = 'Periode berjalan tiap arisan';
  }

  // Status arisan: selesai bila semua peserta jenis arisan itu sudah pernah menerima
  const ids = j ? [Number(j)] : jenis.map((x) => x.id);
  const selesaiList = [];
  let menerima = 0, peserta = 0;
  for (const id of ids) {
    const [[t]] = await db.query('SELECT COUNT(*) n FROM anggota_jenis WHERE jenis_id=?', [id]);
    const [[w]] = await db.query('SELECT COUNT(DISTINCT u.anggota_id) n FROM pengundian u JOIN anggota_jenis aj ON aj.anggota_id=u.anggota_id AND aj.jenis_id=u.jenis_id WHERE u.jenis_id=?', [id]);
    if (j) { menerima = w.n; peserta = t.n; }
    selesaiList.push(t.n > 0 && w.n >= t.n);
  }
  const selesai = selesaiList.length > 0 && selesaiList.every(Boolean);
  const info = j ? `${menerima} dari ${peserta} peserta sudah menerima` : `${selesaiList.filter(Boolean).length} dari ${selesaiList.length} arisan selesai`;

  // BARU: jadwal arisan berikutnya (tanpa daftar nama yang belum bayar)
  const jadwal = await ambilJadwal({ jenisId: j, anggotaId: ikut ? s.anggota_id : '', denganBelum: false });

  const quick = [['/member/riwayat', '🕘', 'Lihat Riwayat'], ['/member/profil', '✏️', 'Edit Profil'], ['/member/upload', '⬆️', 'Upload Bukti Bayar']];
  return (
    <section>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mb-4 text-sm text-slate-500">Selamat datang, {a?.nama}!</p>
      <JenisSelect jenis={jenis} value={j} />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-[#e6cfae] p-4 text-[#2b1a26]">
          <p className="text-xs text-[#2b1a26]/70">Status Pembayaran</p>
          <p className="text-xl font-bold">{status}</p>
          <p className="mt-1 text-xs text-[#2b1a26]/70">{subStatus}</p>
        </div>
        <div className="rounded-xl bg-[#dcbb98] p-4 text-[#2b1a26]"><p className="text-xs text-[#2b1a26]/70">Penerima Arisan Terakhir</p><p className="text-xl font-bold">{pen[0]?.nama || '—'}</p></div>
        <div className="rounded-xl bg-[#d1ab8c] p-4 text-[#2b1a26]">
          <p className="text-xs text-[#2b1a26]/70">Status Arisan</p>
          <p className="text-xl font-bold">{selesai ? '✅ Selesai' : '🔄 Masih Berjalan'}</p>
          <p className="mt-1 text-xs text-[#2b1a26]/70">{info}</p>
        </div>
      </div>

      {/* BARU: banner arisan berikutnya + kalender popup (sama seperti admin) */}
      <JadwalBanner jadwal={jadwal} ym={hariIni().slice(0, 7)} tampilBelum={false} linkDetail="/member/riwayat" />

      <h2 className="mb-2 mt-6 font-semibold">Akses Cepat</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {quick.map(([h, i, l]) => <Link key={h} href={h} className="rounded-xl bg-white p-4 text-center text-sm font-medium shadow-sm hover:bg-[#efe3d0]"><div className="text-2xl">{i}</div>{l}</Link>)}
      </div>
    </section>
  );
}