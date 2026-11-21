export const R = {
  anggota: { table: 'anggota', fields: ['nama', 'telepon'], list: 'SELECT * FROM anggota ORDER BY id' },
  jenis: { table: 'jenis_arisan', fields: ['nama', 'nominal', 'periode'], list: 'SELECT * FROM jenis_arisan ORDER BY id' },
  pembayaran: {
    table: 'pembayaran', fields: ['anggota_id', 'jenis_id', 'nominal', 'tanggal', 'status'],
    list: 'SELECT p.*, a.nama anggota, j.nama jenis FROM pembayaran p JOIN anggota a ON a.id=p.anggota_id JOIN jenis_arisan j ON j.id=p.jenis_id ORDER BY p.tanggal DESC, p.id DESC',
  },
};
