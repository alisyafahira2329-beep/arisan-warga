import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 4000),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
});
const hash = await bcrypt.hash(process.env.ADMIN_PASS, 10);
await db.query('INSERT INTO users (username,password_hash) VALUES (?,?) ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash)', [process.env.ADMIN_USER, hash]);
console.log('Admin dibuat:', process.env.ADMIN_USER);
await db.end();