import mysql from 'mysql2/promise';
export const db = global._pool || (global._pool = mysql.createPool({
  host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASS,
  database: process.env.DB_NAME, dateStrings: true,
}));
