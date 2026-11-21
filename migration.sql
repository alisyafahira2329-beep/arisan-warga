USE arisan_warga;
ALTER TABLE users
  ADD COLUMN role ENUM('admin','anggota') NOT NULL DEFAULT 'admin',
  ADD COLUMN anggota_id INT NULL,
  ADD FOREIGN KEY (anggota_id) REFERENCES anggota(id) ON DELETE CASCADE;
ALTER TABLE pembayaran
  ADD COLUMN bukti VARCHAR(100) NULL,
  MODIFY status ENUM('Lunas','Belum Lunas','Menunggu') NOT NULL DEFAULT 'Belum Lunas';
