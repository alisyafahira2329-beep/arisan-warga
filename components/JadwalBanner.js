'use client';
import { useState } from 'react';
import Kalender from '@/components/Kalender';
import { tglPanjang, tanggalDiBulan, hariIni, fmt } from '@/lib/jadwal';

const IkonKalender = () => (
  <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M8 3v4M16 3v4M3 10h18" />
    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
  </svg>
);

const geser = (ym, k) => {
  const [y, m] = ym.split('-').map(Number);
  return fmt(new Date(Date.UTC(y, m - 1 + k, 1))).slice(0, 7);
};

// tampilBelum : tampilkan daftar yang belum bayar (admin = true, anggota = false)
// linkDetail  : tujuan tombol "Lihat Detail Arisan" (kosongkan untuk menyembunyikan)
export default function JadwalBanner({ jadwal, ym, tampilBelum = true, linkDetail = '/jenis-arisan' }) {
  const today = hariIni();
  const u = jadwal[0]; // arisan terdekat
  const [buka, setBuka] = useState(false);
  const [bulan, setBulan] = useState(u ? u.berikutnya.slice(0, 7) : ym);
  const [dipilih, setDipilih] = useState(u ? u.berikutnya : today);

  const bukaKalender = () => {
    if (u) { setBulan(u.berikutnya.slice(0, 7)); setDipilih(u.berikutnya); }
    setBuka(true);
  };
  const pilih = (t) => { setDipilih(t); setBulan(t.slice(0, 7)); };

  // tanda di kalender untuk bulan yang tampil
  const tanda = {};
  for (const jd of jadwal) for (const t of tanggalDiBulan(jd.mulai, jd.periode, bulan)) (tanda[t] ||= []).push(jd.nama);

  // arisan yang jatuh pada tanggal terpilih
  const kejadian = jadwal.filter((jd) => tanggalDiBulan(jd.mulai, jd.periode, dipilih.slice(0, 7)).includes(dipilih));
  const adalahBerikutnya = u && dipilih === u.berikutnya;
  const status = !kejadian.length ? 'Tidak ada arisan' : dipilih < today ? 'Sudah lewat' : 'Terjadwal';

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-[#c49a78]/50 bg-[#e6cfae]/40 p-4 text-[#2b1a26]">
        <button type="button" onClick={bukaKalender} title="Klik untuk membuka kalender"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#c49a78] transition hover:scale-105">
          <IkonKalender />
        </button>
        {u ? (
          <>
            <div className="min-w-[200px] flex-1">
              <p className="font-bold">Arisan Berikutnya</p>
              <p className="mt-1 text-xs">
                <span className="rounded-full bg-white/70 px-2 py-0.5">
                  {u.nama} · {u.periode === 'bulanan' ? 'Per bulan' : 'Per minggu'}
                </span>
              </p>
              <p className="mt-1 text-sm font-semibold">
                {tglPanjang(u.berikutnya)}{' '}
                <span className="text-xs font-normal text-[#2b1a26]/70">({u.sisa === 0 ? 'hari ini' : `${u.sisa} hari lagi`})</span>
              </p>
            </div>
            <div className="border-l border-[#2b1a26]/20 pl-4">
              <p className="text-xs text-[#2b1a26]/70">Pemenang Terakhir</p>
              <p className="font-semibold">{u.pemenang || 'Belum Diundi'}</p>
            </div>
          </>
        ) : (
          <div className="min-w-[200px] flex-1">
            <p className="font-bold">Arisan Berikutnya</p>
            <p className="text-sm text-[#2b1a26]/70">Jadwal belum diatur.</p>
          </div>
        )}
        <button type="button" onClick={bukaKalender} className="rounded-lg bg-[#2b1a26] px-4 py-2 text-xs font-semibold text-white">
          Lihat Detail →
        </button>
      </div>

      {buka && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setBuka(false)}>
          <div className="max-h-[92vh] w-full max-w-3xl overflow-auto rounded-2xl bg-[#fbf6ee] p-5 text-[#2b1a26] shadow-xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#c49a78]"><IkonKalender /></span>
                <div>
                  <h2 className="text-lg font-bold">Jadwal Arisan</h2>
                  <p className="text-xs text-[#2b1a26]/70">Lihat jadwal dan informasi arisan. Klik tanggal untuk detailnya.</p>
                </div>
              </div>
              <button type="button" onClick={() => setBuka(false)} className="rounded-full border border-[#2b1a26]/30 px-2.5 py-0.5 text-lg" aria-label="Tutup">✕</button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Kalender ym={bulan} onGeser={(k) => setBulan(geser(bulan, k))} tanda={tanda} dipilih={dipilih} onPilih={pilih} today={today} />

              <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                <div className="flex items-center justify-between bg-[#c49a78] px-4 py-3">
                  <p className="font-semibold">{adalahBerikutnya ? 'Arisan Berikutnya' : 'Detail Tanggal'}</p>
                  <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-semibold">{status}</span>
                </div>
                <div className="space-y-3 p-4">
                  <div>
                    <p className="text-xs text-[#2b1a26]/70">Tanggal Pelaksanaan</p>
                    <p className="font-bold">{tglPanjang(dipilih)}</p>
                  </div>
                  {kejadian.length > 0 ? kejadian.map((x) => (
                    <div key={x.id} className="space-y-2 border-t border-[#2b1a26]/10 pt-3">
                      <div>
                        <p className="text-xs text-[#2b1a26]/70">Jenis Arisan</p>
                        <p className="font-bold">{x.nama} <span className="text-xs font-normal text-[#2b1a26]/70">({x.periode === 'bulanan' ? 'Per bulan' : 'Per minggu'})</span></p>
                      </div>
                      <div>
                        <p className="text-xs text-[#2b1a26]/70">Pemenang Terakhir</p>
                        <p className="inline-block rounded-full bg-[#e6cfae] px-3 py-0.5 text-sm font-semibold">{x.pemenang || 'Belum Diundi'}</p>
                      </div>
                      {tampilBelum && x.berikutnya === dipilih && (
                        <div>
                          <p className="text-xs text-[#2b1a26]/70">Belum bayar ({x.belum.length})</p>
                          <p className="text-xs">{x.belum.length ? x.belum.join(', ') : 'Semua sudah lunas'}</p>
                        </div>
                      )}
                    </div>
                  )) : (
                    <div className="border-t border-[#2b1a26]/10 pt-3 text-sm text-[#2b1a26]/70">
                      <p>Tidak ada arisan pada tanggal ini.</p>
                      {u && <button type="button" onClick={() => pilih(u.berikutnya)} className="mt-2 rounded-lg bg-[#e6cfae] px-3 py-1.5 text-xs font-semibold text-[#2b1a26]">Ke arisan berikutnya</button>}
                    </div>
                  )}
                  {u && !adalahBerikutnya && kejadian.length > 0 && (
                    <button type="button" onClick={() => pilih(u.berikutnya)} className="text-xs underline">Kembali ke arisan berikutnya</button>
                  )}
                  {linkDetail && <a href={linkDetail} className="block rounded-lg bg-[#2b1a26] px-4 py-2 text-center text-xs font-semibold text-white">Lihat Detail Arisan →</a>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}