USE arisan_warga;
-- Pendaftaran anggota ke jenis arisan (satu anggota boleh ikut lebih dari satu arisan)
CREATE TABLE IF NOT EXISTS anggota_jenis (
  anggota_id INT NOT NULL,
  jenis_id INT NOT NULL,
  PRIMARY KEY (anggota_id, jenis_id),
  FOREIGN KEY (anggota_id) REFERENCES anggota(id) ON DELETE CASCADE,
  FOREIGN KEY (jenis_id) REFERENCES jenis_arisan(id) ON DELETE CASCADE
);
