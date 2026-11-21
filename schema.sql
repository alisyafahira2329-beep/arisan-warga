CREATE DATABASE IF NOT EXISTS arisan_warga;
USE arisan_warga;
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(100) NOT NULL,
  role ENUM('admin','anggota') NOT NULL DEFAULT 'admin',
  anggota_id INT NULL
);
-- FK users.anggota_id ditambahkan di bawah setelah tabel anggota ada
CREATE TABLE IF NOT EXISTS anggota (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  telepon VARCHAR(20)
);
CREATE TABLE IF NOT EXISTS jenis_arisan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  nominal INT NOT NULL,
  periode VARCHAR(30) NOT NULL
);
CREATE TABLE IF NOT EXISTS anggota_jenis (
  anggota_id INT NOT NULL,
  jenis_id INT NOT NULL,
  PRIMARY KEY (anggota_id, jenis_id),
  FOREIGN KEY (anggota_id) REFERENCES anggota(id) ON DELETE CASCADE,
  FOREIGN KEY (jenis_id) REFERENCES jenis_arisan(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS pembayaran (
  id INT AUTO_INCREMENT PRIMARY KEY,
  anggota_id INT NOT NULL,
  jenis_id INT NOT NULL,
  nominal INT NOT NULL,
  tanggal DATE NOT NULL,
  status ENUM('Lunas','Belum Lunas','Menunggu') NOT NULL DEFAULT 'Belum Lunas',
  bukti VARCHAR(100) NULL,
  FOREIGN KEY (anggota_id) REFERENCES anggota(id) ON DELETE CASCADE,
  FOREIGN KEY (jenis_id) REFERENCES jenis_arisan(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS pengundian (
  id INT AUTO_INCREMENT PRIMARY KEY,
  jenis_id INT NOT NULL,
  anggota_id INT NOT NULL,
  tanggal DATE NOT NULL,
  FOREIGN KEY (anggota_id) REFERENCES anggota(id) ON DELETE CASCADE,
  FOREIGN KEY (jenis_id) REFERENCES jenis_arisan(id) ON DELETE CASCADE
);

ALTER TABLE users ADD FOREIGN KEY (anggota_id) REFERENCES anggota(id) ON DELETE CASCADE;
