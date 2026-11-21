import Crud from '@/components/Crud';
export default function Page() {
  return <Crud title="Jenis Arisan" desc="Kelola jenis arisan warga." res="jenis" addLabel="Tambah Jenis Arisan"
    cols={[{ key: 'nama', label: 'Nama Jenis Arisan' }, { key: 'nominal', label: 'Nominal Iuran', type: 'money' }, { key: 'periode', label: 'Periode' }]} />;
}
