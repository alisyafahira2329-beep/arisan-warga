import Link from 'next/link';
import { fmt, tanggalDiBulan, hariIni } from '@/lib/jadwal';

const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const HARI = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export default function Kalender({ ym, jadwal, jenis }) {
  const [y, m] = ym.split('-').map(Number);
  const tanda = {};
  for (const jd of jadwal) for (const t of tanggalDiBulan(jd.mulai, jd.periode, ym)) (tanda[t] ||= []).push(jd.nama);
  const offset = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;
  const jumlah = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const today = hariIni();
  const geser = (k) => fmt(new Date(Date.UTC(y, m - 1 + k, 1))).slice(0, 7);
  const href = (b) => `/dashboard?${jenis ? `jenis=${jenis}&` : ''}bulan=${b}`;
  const sel = [...Array(offset).fill(null), ...Array.from({ length: jumlah }, (_, i) => i + 1)];
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <Link href={href(geser(-1))} className="px-2 text-lg">‹</Link>
        <h2 className="font-semibold">{BULAN[m - 1]} {y}</h2>
        <Link href={href(geser(1))} className="px-2 text-lg">›</Link>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {HARI.map((h) => <div key={h} className="py-1 font-semibold text-[#2b1a26]/70">{h}</div>)}
        {sel.map((d, i) => {
          if (!d) return <div key={i} />;
          const t = `${ym}-${String(d).padStart(2, '0')}`;
          const ada = tanda[t];
          return (
            <div key={i} title={ada ? ada.join(', ') : undefined}
              className={`rounded-md py-1.5 ${ada ? 'bg-[#c49a78] font-bold text-white' : ''} ${t === today ? 'ring-2 ring-[#2b1a26]' : ''}`}>
              {d}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-[#2b1a26]/70">Tanggal berwarna = jadwal arisan. Kotak bergaris = hari ini.</p>
    </div>
  );
}