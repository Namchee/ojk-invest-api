# _Endpoint `apps`_

Melayani seluruh permintaan mengenai aplikasi manajemen reksa dana resmi yang diizinkan oleh Otoritas Jasa Keuangan Republik Indonesia.

## GET - `/api/apps`

Cari seluruh aplikasi manajemen investasi atau portal transaksi investasi yang telah dinyatakan legal oleh OJK.

### Parameter

**Nama** | **Tipe Data** | **Deskripsi**
---- | ---- | ---------
`name` | `string` | Pola _string_ yang ingin dicari dari nama aplikasi
`limit` | `int` | Jumlah data yang diminta
`start` | `int` | Indeks pertama dari data yang diminta. Dimulai dari 1.

### Status HTTP

**Status** | **Deskripsi**
------ | ---------
`200` | Permintaan berhasil diproses
`400` | Terdapat parameter yang salah atau memiliki nilai yang ilegal
`500` | Data tidak tersedia

### Struktur Data

**Nama** | **Tipe Data** | **Deskripsi**
---- | ---- | ---------
`id` | `number` | Nomor ID aplikasi
`name` | `string` | Nama aplikasi
`url` | `string` | Halaman web pihak penyedia aplikasi
`owner` | `string` | Perusahaan pemilik aplikasi

## GET - `api/apps/:id`

Cari sebuah aplikasi manajemen reksa dana legal yang diizinkan oleh OJK yang memiliki ID yang sama dengan parameter `id`

### Parameter

**Nama** | **Tipe Data** | **Deskripsi**
---- | --------- | --------
`id` | `number` | ID dari aplikasi

### Status HTTP

**Status** | **Deskripsi**
------ | ---------
`200` | Permintaan berhasil diproses
`400` | Terdapat parameter yang salah atau memiliki nilai yang ilegal
`500` | Data tidak tersedia

### Struktur Data

**Nama** | **Tipe Data** | **Deskripsi**
---- | ---- | ---------
`id` | `number` | Nomor ID aplikasi
`name` | `string` | Nama aplikasi
`url` | `string` | Halaman web pihak penyedia aplikasi
`owner` | `string` | Perusahaan pemilik aplikasi
