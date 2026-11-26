# AI Learning Web

Situs materi dan simulasi pembelajaran AI. Frontend statis dipublikasikan lewat
GitHub Pages; Supabase menyediakan autentikasi, database progress, dan fungsi
login dengan username.

## Menyiapkan Supabase

1. Buat proyek Supabase dan periksa batas penggunaan paket gratis.
2. Buka **SQL Editor**, lalu jalankan isi [`supabase/schema.sql`](./supabase/schema.sql).
   Skema ini membuat profil, progress, trigger pendaftaran, dan kebijakan RLS.
3. Isi URL proyek dan **anon/publishable key** di
   [`public/js/supabase-config.js`](./public/js/supabase-config.js). Key ini memang
   digunakan browser; jangan pernah menaruh `service_role` key di file publik.
4. Pasang Supabase CLI, lalu hubungkan proyek dan deploy fungsi username:

   ```powershell
   npx supabase login
   npx supabase link --project-ref PROJECT_REF
   npx supabase functions deploy login-by-username
   ```

5. Di Supabase **Authentication → URL Configuration**, set **Site URL** dan
   **Redirect URLs** ke alamat GitHub Pages Anda, misalnya
   `https://OWNER.github.io/REPOSITORY/`. Tambahkan alamat localhost jika ingin
   menguji secara lokal. Alamat ini juga digunakan untuk konfirmasi email dan
   reset kata sandi.

## Menyiapkan GitHub Pages

1. Buat repository GitHub dengan branch utama bernama `main`, lalu unggah source
   proyek dari komputer Anda. File akun lokal `data/modules.json` dan folder
   `node_modules` dikecualikan oleh `.gitignore`; jangan unggah database lokal.
2. Pada repository, buka **Settings → Pages**, lalu pilih **GitHub Actions**
   sebagai build/deployment source.
3. Workflow [`.github/workflows/pages.yml`](./.github/workflows/pages.yml) akan
   memublikasikan folder `public` setiap kali ada push ke `main`. URL biasanya
   berbentuk `https://OWNER.github.io/REPOSITORY/`.
4. Pastikan URL tersebut tercantum di Supabase Redirect URLs. Setelah workflow
   selesai, buka URL GitHub Pages dan buat akun baru.

Repository publik membuat source yang diunggah terlihat publik. File konfigurasi
browser hanya boleh berisi URL proyek Supabase dan anon/publishable key. RLS pada
database membatasi akses data per pengguna; jangan pernah menonaktifkannya.

## Catatan penting

- GitHub Pages tidak menjalankan `server.js`; aplikasi hosted memakai Supabase.
- Akun dan progress dalam `data/modules.json` lokal tidak dimigrasikan. Pengguna
  perlu mendaftar ulang di aplikasi hosted.
- Login email memakai Supabase Auth. Login username memakai Edge Function
  `login-by-username`; deploy fungsi tersebut agar login username berfungsi.
- Supabase free tier memiliki kuota dan batas email. Ketersediaan email verifikasi
  dan reset kata sandi bergantung pada konfigurasi Supabase/SMTP.

## Fitur pembelajaran

Setiap modul berisi submateri. Modul KNN, Naive Bayes, dan Backpropagation
menyediakan simulasi interaktif. **Alat Bantu Belajar** dan **Latihan Soal**
memberi umpan balik, kunci jawaban, serta contoh jawaban essay. Skor essay
merupakan perkiraan berdasarkan kecocokan kata kunci, bukan penilaian semantik.
