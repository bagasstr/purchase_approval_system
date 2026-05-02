# Approva

Approva adalah aplikasi manajemen pengajuan pembelian dan persetujuan berjenjang berbasis Next.js.

## Stack Utama

- Next.js App Router
- React + TypeScript
- Prisma + PostgreSQL
- Better Auth
- React Query
- Tailwind CSS + komponen UI berbasis Radix

## Fitur Inti

- Autentikasi pengguna
- Dashboard ringkasan dan analitik
- Pengajuan purchase request
- Alur approval multi-step berdasarkan role/permission
- Manajemen user, role, dan department
- Notifikasi in-app

## Menjalankan Proyek

1. Install dependency:

```bash
pnpm install
```

2. Siapkan environment variable (database dan auth).

3. Jalankan migrasi Prisma:

```bash
pnpm prisma migrate dev
```

4. Jalankan development server:

```bash
pnpm dev
```

5. Buka aplikasi di [http://localhost:3000](http://localhost:3000).
