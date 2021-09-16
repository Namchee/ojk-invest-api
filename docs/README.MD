# Dokumentasi API

> Sebagian besar _endpoint_ dalam API ini akan disimpan dalam _cache_ yang berumur 12 jam.

Seluruh _endpoint_ yang dapat dipanggil pada API ini memiliki format _data_ berikut:

**Nama** | **Deskripsi**
---- | ---------
`data` | Data yang dikembalikan. Akan bernilai `null` apabila `error` tidak bernilai `null`
`error` | Pesan kesalahan yang terjadi. Akan bernilai `null` apabila `data` tidak bernilai `null`.

Nilai `data` akan selalu memiliki dua _key_ (kunci) berikut

**Nama** | **Deskripsi**
---- | ---------
`<nama_entitas>` | Entitas yang dicari
`version` | Tanggal pembaruan data. Memiliki format `DD/MM/YYYY`

Setiap berkas _markdown_ yang ada pada _folder_ ini merupakan sebuah _endpoint_ yang dapat dipanggil melalui `/api/<nama_berkas>`. Dokumentasi untuk masing-masing _endpoint_ dapat dilihat melalui berkas _markdown_ dengan nama yang sama.

Seluruh dokumentasi untuk _endpoint_ yang tersedia memiliki format berikut:

## Method HTTP - `<endpoint>`

Deskripsi singkat dari _endpoint_ tersebut.

### Parameter

Daftar parameter yang dapat disematkan pada *endpoint*, beserta tipe data dan penjelasan mengenai parameter tersebut.

Parameter dapat disematkan dalam bentuk _querystring_ atau disematkan dalam URL apabila _endpoint_ memiliki parameter (contoh: `xxx/:id` mengharuskan `:id` diteruskan melalui URL)

### Status HTTP

Status HTTP kembalian yang mungkin dikembalikan, beserta deskripsi untuk masing-masing status HTTP yang mungkin dikembalikan oleh sebuah _endpoint_.

### Struktur Data

Bentuk objek dari `data` yang dikembalikan, beserta tipe data dan deskripsi untuk masing-masing _key_ (kunci) yang terdapat pada objek tersebut.
