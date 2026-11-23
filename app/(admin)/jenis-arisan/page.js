import Crud from '@/components/Crud';
export default function Page() {
  return <Crud title="Jenis Arisan" desc="Kelola jenis arisan warga." res="jenis" addLabel="Tambah Jenis Arisan"
    formTitle="Jenis Arisan" formDesc="Atur detail jenis arisan sesuai kebutuhan."
    formNote="Jika tidak ada tanggal selesai, maka arisan akan berjalan secara berkelanjutan."
    cols={[
      { key: 'nama', label: 'Nama Jenis Arisan', placeholder: 'Contoh: Arisan RT 05' },
      { key: 'nominal', label: 'Nominal Iuran', type: 'money', placeholder: 'Contoh: 10000' },
      { key: 'frekuensi', label: 'Jenis Periode', type: 'cards', def: 'bulanan',
        cards: [{ value: 'bulanan', label: 'Bulanan', sub: 'Setiap 1 bulan' }, { value: 'mingguan', label: 'Mingguan', sub: 'Setiap 7 hari' }] },
      { key: 'tanggal_mulai', label: 'Tanggal Mulai', type: 'date', half: true },
      { key: 'tanggal_selesai', label: 'Tanggal Selesai (Opsional)', short: 'Tanggal Selesai', type: 'date', half: true, optional: true },
      { key: 'periode', label: 'Periode', view: true },
    ]} />;
}