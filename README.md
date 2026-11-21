# Arisan Warga (Next.js + Tailwind + MySQL)
1. `npm install`
2. `mysql -u root -p < schema.sql`
3. `cp .env.example .env.local` lalu isi kredensial & JWT_SECRET
4. `npm run seed` (membuat admin; password disimpan sebagai hash bcrypt)
5. `npm run dev` → http://localhost:3000

## Pembaruan: dashboard anggota
- Database lama: jalankan `mysql -u root -p < migration.sql` (database baru cukup `schema.sql`).
- Admin membuat akun anggota di menu Data Anggota (isi Username + Password).
- Anggota login di /login dan diarahkan ke /member. Bukti bayar disimpan di folder `uploads/`.
