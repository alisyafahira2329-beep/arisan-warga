'use client';
import { useState } from 'react';
import Kalender from '@/components/Kalender';
import { tglPanjang } from '@/lib/jadwal';

const IkonKalender = () => (
  <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M8 3v4M16 3v4M3 10h18" />
    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
  </svg>
);

export default function JadwalBanner({ jadwal, ym, jenis, pemenang, bukaAwal }) {
  const [buka, setBuka] = useState(!!bukaAwal);
  const u = jadwal[0]; // arisan terdekat

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-[#c49a78]/50 bg-[#e6cfae]/40 p-4 text-[#2b1a26]">
        <button type="button" onClick={() => setBuka(true)} title="Klik untuk membuka kalender"
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
                {tglPanjang(u.berikutnya)} <span className="text-xs font-normal text-[#2b1a26]/70">
                  ({u.sisa === 0 ? 'hari ini' : `${u.sisa} hari lagi`})
                </span>
              </p>
            </div>
            <div className="border-l border-[#2b1a26]/20 pl-4">
              <p className="text-xs text-[#2b1a26]/70">Pemenang Terakhir</p>
              <p className="font-semibold">{pemenang || '—'}</p>
            </div>
          </>
        ) : (
          <div className="min-w-[200px] flex-1">
            <p className="font-bold">Arisan Berikutnya</p>
            <p className="text-sm text-[#2b1a26]/70">Jadwal belum diatur.</p>
          </div>
        )}

        <button type="button" onClick={() => setBuka(true)}
          className="rounded-lg bg-[#2b1a26] px-4 py-2 text-xs font-semibold text-white">
          Lihat Detail →
        </button>
      </div>

      {buka && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setBuka(false)}>
          <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-xl bg-[#fbf6ee] p-4 text-[#2b1a26] shadow-xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Jadwal Arisan</h2>
              <button type="button" onClick={() => setBuka(false)} className="px-2 text-lg" aria-label="Tutup">✕</button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Kalender ym={ym} jadwal={jadwal} jenis={jenis} />
              <div className="space-y-3">
                {!jadwal.length && <p className="text-sm text-slate-500">Isi periode dan tanggal_mulai pada jenis arisan.</p>}
                {jadwal.map((x) => (
                  <div key={x.id} className="rounded-lg bg-[#e6cfae]/50 p-3">
                    <p className="text-sm font-semibold">
                      {x.nama} <span className="text-xs font-normal text-[#2b1a26]/70">({x.periode === 'bulanan' ? 'Per bulan' : 'Per minggu'})</span>
                    </p>
                    <p className="text-sm">Berikutnya: <b>{tglPanjang(x.berikutnya)}</b></p>
                    <p className="text-sm">Sebelumnya: {x.sebelumnya ? tglPanjang(x.sebelumnya) : 'Belum ada'}</p>
                    <p className="mt-2 text-xs font-semibold">Belum bayar ({x.belum.length}):</p>
                    <p className="text-xs">{x.belum.length ? x.belum.join(', ') : 'Semua sudah lunas'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}