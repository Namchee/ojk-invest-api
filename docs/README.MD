# Dokumentasi API

Seluruh _endpoint_ yang dapat dipanggil pada API ini memiliki format kembalian berikut:

**Nama** | **Deskripsi**
---- | ---------
`data` | Data yang dikembalikan
`version` | Tanggal pengambilan data. Ditulis dalam format `MM/DD/YYYY`

Setiap berkas _markdown_ yang ada pada _folder_ ini merupakan sebuah _endpoint_ yang dapat dipanggil melalui `/api/<nama_berkas>`. Dokumentasi untuk masing-masing _endpoint_ dapat dilihat melalui berkas _markdown_ dengan nama yang sama.

Seluruh dokumentasi untuk _endpoint_ yang tersedia memiliki format berikut:

## Method HTTP - `<endpoint>`

Deskripsi singkat dari _endpoint_ tersebut.

### Parameter

Daftar parameter yang dapat disematkan pada *endpoint*, beserta tipe data dan penjelasan mengenai parameter tersebut.

> Parameter disematkan menggunakan _querystring_

### Status HTTP

Status HTTP kembalian yang mungkin dikembalikan, beserta deskripsi untuk masing-masing status HTTP yang mungkin dikembalikan.

### Struktur Data

Bentuk objek dari `data` yang dikembalikan, beserta tipe data dan deskripsi untuk masing-masing `key` yang terdapat pada objek tersebut.
