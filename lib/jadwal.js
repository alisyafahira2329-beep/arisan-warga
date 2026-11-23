export const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
export const fmt = (d) => d.toISOString().slice(0, 10);
export const s10 = (v) => {
  if (!v) return null;
  if (v instanceof Date) { const p = (n) => String(n).padStart(2, '0'); return `${v.getFullYear()}-${p(v.getMonth() + 1)}-${p(v.getDate())}`; }
  return String(v).slice(0, 10);
};
export const hariIni = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' });
export const tglPanjang = (s) => new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(parse(s));

// tanggal arisan ke-n (n mulai dari 0)
export function tanggalKe(mulai, periode, n) {
  const d = parse(mulai);
  if (periode === 'mingguan') { d.setUTCDate(d.getUTCDate() + 7 * n); return fmt(d); }
  const y = d.getUTCFullYear(), m = d.getUTCMonth() + n, hari = d.getUTCDate();
  const akhir = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return fmt(new Date(Date.UTC(y, m, Math.min(hari, akhir))));
}

export function jadwalTerdekat(mulai, periode, today) {
  let n = 0;
  while (n < 5000 && tanggalKe(mulai, periode, n) <= today) n++;
  return { sebelumnya: n > 0 ? tanggalKe(mulai, periode, n - 1) : null, berikutnya: tanggalKe(mulai, periode, n) };
}

// semua tanggal arisan di bulan ym ('YYYY-MM')
export function tanggalDiBulan(mulai, periode, ym) {
  const out = [];
  for (let n = 0; n < 5000; n++) {
    const t = tanggalKe(mulai, periode, n);
    if (t > ym + '-31') break;
    if (t.startsWith(ym)) out.push(t);
  }
  return out;
}