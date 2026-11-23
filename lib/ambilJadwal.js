import { db } from '@/lib/db';
import { s10, hariIni, jadwalTerdekat, parse } from '@/lib/jadwal';

// Mengambil jadwal arisan (frekuensi + tanggal_mulai) untuk banner "Arisan Berikutnya".
//  jenisId     : batasi ke satu jenis arisan (opsional, mis. dari dropdown)
//  anggotaId   : hanya jenis arisan yang diikuti anggota itu (opsional, untuk dashboard anggota)
//  denganBelum : false = daftar nama yang belum bayar TIDAK diambil (wajib false untuk anggota)
export async function ambilJadwal({ jenisId = '', anggotaId = '', denganBelum = true } = {}) {
  const today = hariIni();
  const w = [];
  const p = [];
  if (jenisId) { w.push('id=?'); p.push(jenisId); }
  if (anggotaId) { w.push('id IN (SELECT jenis_id FROM anggota_jenis WHERE anggota_id=?)'); p.push(anggotaId); }
  let jj = [];
  try {
    [jj] = await db.query(`SELECT id, nama, frekuensi, tanggal_mulai FROM jenis_arisan ${w.length ? 'WHERE ' + w.join(' AND ') : ''} ORDER BY id`, p);
  } catch { jj = []; }

  const jadwal = [];
  for (const x of jj) {
    const mulai = s10(x.tanggal_mulai);
    const f = String(x.frekuensi || '').toLowerCase();
    const per = f.includes('minggu') ? 'mingguan' : f.includes('bulan') ? 'bulanan' : null;
    if (!mulai || !per) continue;
    const { sebelumnya, berikutnya } = jadwalTerdekat(mulai, per, today);

    let belum = [];
    if (denganBelum) {
      const [r] = await db.query(
        `SELECT a.nama FROM anggota_jenis aj JOIN anggota a ON a.id=aj.anggota_id
         WHERE aj.jenis_id=? AND NOT EXISTS (
           SELECT 1 FROM pembayaran p WHERE p.anggota_id=aj.anggota_id AND p.jenis_id=aj.jenis_id
           AND p.status='Lunas' AND p.tanggal>=? AND p.tanggal<?) ORDER BY a.nama`,
        [x.id, sebelumnya || '1970-01-01', berikutnya]);
      belum = r.map((b) => b.nama);
    }

    let pemenang = null;
    try {
      const [[wn]] = await db.query('SELECT a.nama FROM pengundian u JOIN anggota a ON a.id=u.anggota_id WHERE u.jenis_id=? ORDER BY u.id DESC LIMIT 1', [x.id]);
      pemenang = wn?.nama || null;
    } catch { pemenang = null; }

    jadwal.push({
      id: x.id, nama: x.nama, periode: per, mulai, sebelumnya, berikutnya, pemenang, belum,
      sisa: Math.round((parse(berikutnya) - parse(today)) / 86400000),
    });
  }
  jadwal.sort((a, b) => a.berikutnya.localeCompare(b.berikutnya));
  return jadwal;
}