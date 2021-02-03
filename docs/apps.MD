# GET - `/api/apps`

Cari seluruh aplikasi manajemen investasi atau portal transaksi investasi yang telah dinyatakan legal oleh OJK.

## Parameter

**Nama** | **Tipe Data** | **Deskripsi**
---- | ---- | ---------
`name` | `string` | Pola _string_ yang ingin dicari dari nama aplikasi
`limit` | `int` | Jumlah data yang diminta
`start` | `int` | Indeks pertama dari data yang diminta. Dimulai dari 1.

## Status HTTP

**Status** | **Deskripsi**
------ | ---------
`200` | Permintaan berhasil diproses
`422` | Terdapat parameter yang salah atau memiliki nilai yang ilegal
`500` | Data tidak tersedia

## Struktur Data

**Nama** | **Tipe Data** | **Deskripsi**
---- | ---- | ---------
`name` | `string` | Nama aplikasi
`url` | `string` | Halaman web pihak penyedia aplikasi
`owner` | `string` | Perusahaan pemilik aplikasi
