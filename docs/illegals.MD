# GET - `/api/illegals`

Cari seluruh produk investasi yang telah dinyatakan illegal oleh OJK.

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
`id` | `number` | Nomor ID produk investasi illegal
`name` | `string` | Nama produk investasi illegal
`address` | `string` | Alamat pihak penyedia produk investasi illegal
`number` | `string[]` | Daftar nomor telepon pihak penyedia produk investasi illegal
`email` | `string[]` | Daftar alamat _email_ pihak penyedia produk investasi illegal
`url` | `string[]` | Daftar halaman web pihak penyedia produk investasi illegal
`type` | `string` | Jenis produk investasi
`inputDate` | `string` | Tanggal _input_ produk investasi, ditulis dalam format `MM/DD/YYYY`
`details` | `string` | Surat putusan OJK tentang legalitas dari produk investasi yang bersangkutan
