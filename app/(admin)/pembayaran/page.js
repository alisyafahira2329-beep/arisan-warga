import Crud from '@/components/Crud';
export default function Page() {
  return <Crud title="Pembayaran Iuran" desc="Catat, pantau, dan verifikasi pembayaran iuran anggota." res="pembayaran" addLabel="Catat Pembayaran" filterJenis
    cols={[
      { key: 'anggota_id', label: 'Nama Anggota', from: 'anggota', show: 'anggota' },
      { key: 'jenis_id', label: 'Jenis Arisan', from: 'jenis', show: 'jenis' },
      { key: 'nominal', label: 'Nominal', type: 'money' },
      { key: 'tanggal', label: 'Tanggal', type: 'date' },
      { key: 'status', label: 'Status', opts: ['Lunas', 'Belum Lunas', 'Menunggu'] },
      { key: 'bukti', label: 'Bukti', view: true },
    ]} />;
}
