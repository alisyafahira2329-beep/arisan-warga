import Link from 'next/link';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
const nav = [['/member', 'Dashboard'], ['/member/riwayat', 'Lihat Riwayat'], ['/member/profil', 'Edit Profil'], ['/member/upload', 'Upload Bukti Bayar']];
export default async function MemberLayout({ children }) {
  const s = await getSession();
  const [[a]] = await db.query('SELECT nama FROM anggota WHERE id=?', [s.anggota_id]);
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex shrink-0 flex-col bg-navy p-3 text-sm text-indigo-100 md:w-56">
        <div className="mb-3 px-3 py-2"><div className="text-lg font-bold text-white">🏠 Arisan Warga</div><div className="mt-1 text-xs">Anggota: {a?.nama}</div></div>
        <nav className="flex flex-wrap gap-1 md:flex-col">
          {nav.map(([h, l]) => <Link key={h} href={h} className="rounded-md px-3 py-2 hover:bg-brand hover:text-white">{l}</Link>)}
        </nav>
        <form action="/api/logout" method="post" className="mt-2 md:mt-auto">
          <button className="w-full rounded-md px-3 py-2 text-left hover:bg-brand hover:text-white">Keluar</button>
        </form>
      </aside>
      <main className="flex-1 p-5 md:p-8">{children}</main>
    </div>
  );
}
