# 📝 SISTEM UJIAN ONLINE

Sistem Ujian Online adalah aplikasi berbasis web yang dirancang untuk mendukung pelaksanaan ujian secara daring dengan fitur lengkap, aman, dan terstruktur untuk **Admin**, **Guru**, dan **Siswa**.

---

## 🚀 Teknologi yang Digunakan

- **React + Vite** – Framework UI modern & cepat.
- **Chakra UI** – Komponen UI yang responsif dan mudah digunakan.
- **Firebase** – Otentikasi, Firestore Database, dan Hosting.
- **jspdf + xlsx** – Untuk export nilai dalam format PDF & Excel.

---

## 🔐 Autentikasi & Role

Menggunakan **Firebase Authentication**:
- Login via **Email/Password** dan **Google SSO**
- Role-based routing:
  - `Admin`
  - `Guru`
  - `Siswa`
- Middleware proteksi rute sesuai role
- Cegah multi-login
- Registrasi mandiri untuk `Guru` dan `Siswa` tanpa approval

---

## 🧭 Struktur Role & Fitur

### 🧑‍💼 Admin
- Dashboard statistik (jumlah siswa, guru, soal, rata-rata nilai)
- Manajemen Siswa, Guru, Mapel, Kelas & Subkelas
- Manajemen Soal (CRUD + Builder)
- Lihat dan filter Hasil Ujian
- Export Nilai (PDF/Excel)
- Fitur **Audit Log**: pantau semua perubahan sistem
- Rekap Nilai & Arsip

---

### 🧑‍🏫 Guru
- Soal Builder (acak soal & jawaban, support gambar & teks)
- Aktivasi Ujian berdasarkan waktu & kelas
- Pantau siswa realtime (anti-cheat: blur/tab switch)
- Hasil & Review jawaban siswa
- Publikasi nilai
- Arsip & pemulihan soal / rekap

---

### 🧑‍🎓 Siswa
- Daftar ujian aktif berdasarkan kelas & mapel
- Fullscreen Mode + Timer Countdown
- Auto-save, Anti-Cheat (maks 3x pindah tab)
- Submit jawaban satu kali
- Riwayat Nilai & Status (Lulus / Tidak Lulus)
- Review jawaban jika sudah dipublikasikan

---

## 📦 Instalasi Lokal

```bash
git clone https://github.com/namakamu/sistem-ujian-online.git
cd sistem-ujian-online
npm install
npm run dev
```

### 🔧 Konfigurasi Firebase

1. Buat project di Firebase
2. Aktifkan **Authentication** (Email/Password + Google)
3. Buat **Cloud Firestore** & atur struktur koleksi:
   - `users`, `soal`, `ujianAktif`, `jawaban`, `auditLogs`, dst
4. Tambahkan file `firebase.js`:

```js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  ...
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

---

## 📁 Struktur Folder (Simplified)

```
src/
├── components/
├── context/AuthContext.js
├── pages/
│   ├── Admin/
│   ├── Guru/
│   ├── Siswa/
├── firebase.js
├── routes/
├── utilities/
│   ├── logAudit.js
│   └── formatTahun.js
```

---

## ✅ Fitur Khusus

- 🔐 Middleware Role-based
- 📄 Audit Log Global (create/edit/delete)
- 📥 Export PDF & Excel
- 🎨 Mobile Friendly UI (Chakra Responsive)
- ⛔ Anti-Cheat: deteksi keluar tab, blur, print-screen
- 🗃️ Soal & Nilai bisa diarsipkan & dipulihkan

---

## 🧪 Testing Manual

- ✅ Register & login (Guru & Siswa)
- ✅ CRUD Soal & Aktivasi
- ✅ Simulasi Ujian (Siswa)
- ✅ Anti-cheat saat ujian (maks 3x blur → auto-submit)
- ✅ Review & Rekap Nilai
- ✅ Audit log muncul saat aksi data

---

## 📤 Deployment

- Jalankan:
```bash
npm run build
firebase deploy
```

---

## 🙏 Kontribusi

Pull request & issue sangat diterima. Proyek ini dikembangkan untuk memudahkan digitalisasi ujian sekolah.

---

## 🧑‍💻 Developer

**Nama**: [@mahpudeen](mailto:mahpudeen@gmail.com)  
**Role**: Fullstack Developer – React, Firebase