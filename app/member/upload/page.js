import { db } from '@/lib/db';
import UploadForm from '@/components/UploadForm';
export const dynamic = 'force-dynamic';
export default async function Upload() {
  const [jenis] = await db.query('SELECT id, nama FROM jenis_arisan');
  return (
    <section className="max-w-md">
      <h1 className="text-2xl font-bold">Upload Bukti Bayar</h1>
      <p className="mb-4 text-sm text-slate-500">Unggah foto bukti pembayaran untuk konfirmasi.</p>
      <UploadForm jenis={jenis} />
    </section>
  );
}
