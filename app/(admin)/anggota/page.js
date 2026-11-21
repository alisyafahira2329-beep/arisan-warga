import Crud from '@/components/Crud';
export default function Page() {
  return <Crud title="Data Anggota" desc="Kelola data anggota dan akun login mereka." res="anggota" addLabel="Tambah Anggota" filterJenis
    cols={[
      { key: 'nama', label: 'Nama Anggota' },
      { key: 'telepon', label: 'Nomor Telepon', optional: true },
      { key: 'jenis_ids', label: 'Jenis Arisan', multi: true, from: 'jenis', show: 'jenis_nama', def: [] },
      { key: 'username', label: 'Username Login', optional: true },
      { key: 'password', label: 'Password (kosongkan jika tidak diubah)', type: 'password', optional: true, hide: true },
    ]} />;
}