# GET - `/api/ilegal`

Cari seluruh produk investasi yang telah dinyatakan ilegal oleh OJK.

## Parameter

**Nama** | **Tipe Data** | **Deskripsi**
---- | ---- | ---------
`name` | `string` | Pola _string_ yang ingin dicari dari nama produk investasi
`limit` | `int` | Jumlah data yang diminta
`start` | `int` | Indeks pertama dari data yang diminta. Dimulai dari 1.

## Status HTTP

**Status** | **Deskripsi**
------ | ---------
`200` | Permintaan berhasil diproses
`400` | Terdapat parameter yang salah atau memiliki nilai yang ilegal
`500` | Data tidak tersedia

## Struktur Data

**Nama** | **Tipe Data** | **Deskripsi**
---- | ---- | ---------
`name` | `string` | Nama produk investasi
`address` | `string` | Alamat pihak penyedia produk investasi
`number` | `string[]` | Daftar nomor telepon pihak penyedia produk investasi
`url` | `string[]` | Daftar halaman web pihak penyedia produk investasi
`type` | `string` | Jenis produk investasi
`inputDate` | `string` | Tanggal _input_ produk investasi, ditulis dalam format `MM/DD/YYYY`
`details` | `string` | Surat putusan OJK tentang legalitas dari produk investasi yang bersangkutan
