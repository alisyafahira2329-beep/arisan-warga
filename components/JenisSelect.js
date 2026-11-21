'use client';
import { usePathname, useRouter } from 'next/navigation';
export default function JenisSelect({ jenis, value }) {
  const router = useRouter(); const path = usePathname();
  return (
    <label className="mb-4 flex items-center gap-2 text-sm">Jenis Arisan:
      <select className="inp w-full sm:w-64" value={value || ''} onChange={(e) => router.push(e.target.value ? `${path}?jenis=${e.target.value}` : path)}>
        <option value="">Semua Jenis</option>
        {jenis.map((j) => <option key={j.id} value={j.id}>{j.nama}</option>)}
      </select>
    </label>
  );
}
