# GET - `/api/products`

Cari seluruh produk reksa dana yang telah dinyatakan legal oleh OJK.

## Parameter

**Nama** | **Tipe Data** | **Deskripsi**
---- | ---- | ---------
`name` | `string` | Pola _string_ yang ingin dicari dari nama produk reksa dana
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
`name` | `string` | Nama produk reksa dana
`management` | `string` | Pihak pengelola produk reksa dana
`custodian` | `string` | [Bank kustodian](https://id.wikipedia.org/wiki/Bank_kustodian) dari produk reksa dana
`type` | `string` | Jenis reksa dana
