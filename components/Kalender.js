'use client';

const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const HARI = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export default function Kalender({ ym, onGeser, tanda, dipilih, onPilih, today }) {
  const [y, m] = ym.split('-').map(Number);
  const offset = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;
  const jumlah = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const sel = [...Array(offset).fill(null), ...Array.from({ length: jumlah }, (_, i) => i + 1)];
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <button type="button" onClick={() => onGeser(-1)} className="rounded-full bg-[#e6cfae] px-3 py-1 text-lg" aria-label="Bulan sebelumnya">‹</button>
        <h2 className="font-semibold">{BULAN[m - 1]} {y}</h2>
        <button type="button" onClick={() => onGeser(1)} className="rounded-full bg-[#e6cfae] px-3 py-1 text-lg" aria-label="Bulan berikutnya">›</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {HARI.map((h) => <div key={h} className="py-1 font-semibold text-[#2b1a26]/70">{h}</div>)}
        {sel.map((d, i) => {
          if (!d) return <div key={i} />;
          const t = `${ym}-${String(d).padStart(2, '0')}`;
          const ada = tanda[t];
          const pilih = t === dipilih;
          return (
            <button key={i} type="button" onClick={() => onPilih(t)} title={ada ? ada.join(', ') : undefined}
              className={`rounded-md py-2 transition hover:bg-[#e6cfae]/70 ${
                pilih ? 'bg-[#2b1a26] font-bold text-white hover:bg-[#2b1a26]'
                  : ada ? 'bg-[#e6cfae] font-bold' : ''
              } ${t === today && !pilih ? 'ring-2 ring-[#c49a78]' : ''}`}>
              {d}
              {ada && <span className={`mx-auto mt-0.5 block h-1 w-1 rounded-full ${pilih ? 'bg-white' : 'bg-[#c49a78]'}`} />}
            </button>
          );
        })}
      </div>
      <p className="mt-3 flex flex-wrap gap-x-4 text-xs text-[#2b1a26]/70">
        <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#e6cfae]" />Tanggal Arisan</span>
        <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#2b1a26]" />Tanggal Dipilih</span>
        <span><span className="mr-1 inline-block h-2 w-2 rounded-full ring-2 ring-[#c49a78]" />Hari Ini</span>
      </p>
    </div>
  );
}