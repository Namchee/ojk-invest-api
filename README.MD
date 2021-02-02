# OJK Invest Portal API

API publik yang menyediakan data-data mengenai investasi yang dikelola oleh [Otoritas Jasa Keuangan Republik Indonesia](https://www.ojk.go.id/Default.aspx)

## Daftar Isi

1. [_Endpoint_](#endpoint)
2. [Kontributor](#kontributor)
3. [Lisensi](#lisensi)

## _Endpoint_

Seluruh _endpoint_ yang dapat dipanggil pada API ini memiliki format kembalian berikut:

Nama | Deskripsi
---- | ---------
`data` | Data yang dikembalikan
`version` | Tanggal pengambilan data. Ditulis dalam format `MM/DD/YYYY`

Berikut merupakan daftar _endpoint_ yang dapat dipanggil pada API ini:

### `GET /api/ilegal`

Cari seluruh produk investasi yang telah dinyatakan ilegal oleh OJK.

### Parameter

Nama | Tipe | Deskripsi
---- | ---- | ---------
`name` | `string` | Pola _string_ yang ingin dicari dari nama produk investasi
`limit` | `int` | Jumlah data yang diminta
`start` | `int` | Indeks pertama dari data yang diminta. Dimulai dari 1.

### Status HTTP

Status | Deskripsi
------ | ---------
`200` | Respon berhasil dikembalikan
`500` | Data tidak tersedia

### Data Kembalian

Nama | Tipe | Deskripsi
---- | ---- | ---------
`name` | `string` | Nama produk investasi
`address` | `string` | Alamat pihak penyedia produk investasi
`number` | `string[]` | Daftar nomor telepon pihak penyedia produk investasi
`url` | `string[]` | Daftar halaman web pihak penyedia produk investasi
`type` | `string` | Jenis produk investasi
`inputDate` | `string` | Tanggal _input_ produk investasi, ditulis dalam format `MM/DD/YYYY`
`details` | `string` | Surat putusan OJK tentang legalitas dari produk investasi yang bersangkutan

### `GET /api/apps`

Cari seluruh aplikasi manajemen investasi atau portal transaksi investasi yang telah dinyatakan legal oleh OJK.

### Parameter

Nama | Tipe | Deskripsi
---- | ---- | ---------
`name` | `string` | Pola _string_ yang ingin dicari dari nama aplikasi
`limit` | `int` | Jumlah data yang diminta
`start` | `int` | Indeks pertama dari data yang diminta. Dimulai dari 1.

### Status HTTP

Status | Deskripsi
------ | ---------
`200` | Respon berhasil dikembalikan
`500` | Data tidak tersedia

### Data Kembalian

Nama | Tipe | Deskripsi
---- | ---- | ---------
`name` | `string` | Nama aplikasi
`url` | `string` | Halaman web pihak penyedia aplikasi
`owner` | `string` | Perusahaan pemilik aplikasi

## Kontributor

1. Cristopher 'Namchee' — [GitHub](https://github.com/Namchee)

## Lisensi

_Source code_ dari API publik ini dilindungi oleh [lisensi MIT](./LICENSE).
