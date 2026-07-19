# Web Portofolio Kelas X-B
**SMAN 6 Kabupaten Tangerang — 2026/2027**

---

## Cara Jalankan

Website ini butuh **local server** (tidak bisa dibuka langsung klik file).
Opsi paling gampang:

### Opsi 1 — VS Code Live Server (Recommended)
1. Install extension **Live Server** di VS Code
2. Klik kanan `index.html` → **Open with Live Server**
3. Browser otomatis terbuka di `http://127.0.0.1:5500`

### Opsi 2 — Command Prompt / Terminal
```
cd "C:\Users\holil\Downloads\X.B"
python -m http.server 5174
```
Buka `http://localhost:5174`

---

## Cara Tambah Siswa / Siswi

### 1. Buat folder di `siswa/` atau `siswi/`
Nama folder = nomor urut. Contoh untuk siswa ke-4:
```
siswa/
└── 4/
    ├── 1.txt   ← data teks
    └── 1.png   ← foto (opsional)
```

### 2. Isi file `1.txt` dengan format ini:
```
Nama: Nama Lengkap Siswa
Asal: Nama SMP Asal
Hobi: Hobi 1, Hobi 2
Cita-cita: Cita-cita siswa
```

> **Catatan:** Nama field harus persis seperti di atas (ada titik dua `:` setelah nama field).

### 3. Foto (opsional)
- Taruh foto dengan nama `1.png` di folder yang sama
- Kalau tidak ada foto, akan muncul icon default secara otomatis
- Format: `.png`, `.jpg` boleh (tapi nama tetap `1.png`)

---

## Cara Tambah Foto Wali Kelas

Taruh foto di:
```
walas/
└── 1.png
```

Edit data di `walas/1.txt`:
```
Nama: Yudha Agustian, S.Pd
Jabatan: Wali Kelas X-B
Mapel: Nama Mata Pelajaran
Pesan: Pesan untuk kelas
```

---

## Cara Tambah Memori Kelas

Taruh foto di folder `image/` dengan nama:
```
image/
├── 1.png
├── 2.png
├── 3.png
├── 4.png
└── 5.png
```

> Sistem auto-detect sampai `10.png`. Foto yang tidak ada akan di-skip dengan placeholder yang rapi.

---

## Struktur Folder Lengkap

```
X.B/
├── index.html          ← Jangan diubah
├── style.css           ← Jangan diubah
├── app.js              ← Jangan diubah
├── siswa/
│   ├── 1/ → 1.txt + 1.png
│   ├── 2/ → 1.txt + 1.png
│   └── ... (nomor berurutan)
├── siswi/
│   ├── 1/ → 1.txt + 1.png
│   └── ...
├── walas/
│   ├── 1.txt
│   └── 1.png
└── image/
    ├── 1.png
    └── ... 10.png
```

---

## Tips

- Nomor folder **tidak harus urut tanpa gap** — boleh ada 1, 2, 5, 7 (3, 4, 6 dilewati)
- Foto otomatis disesuaikan ke proporsi **3:4** (portrait)
- Search bar di tab Siswa/Siswi bisa dipakai untuk cari nama
- Klik card untuk lihat detail profil siswa
- Klik foto di Memori Kelas untuk zoom

---

*Made with Neubrutalism — X-B 2024/2025*
