# _Endpoint `status`_

Merupakan _endpoint_ yang dipanggil untuk memeriksa kondisi dari API

## GET - `/api/status`

Periksa kondisi dari API secara keseluruhan, baik _uptime_ dari API maupun kemuktahiran dan validitas data yang ada dalam API.

> _Endpoint_ ini tidak disimpan dalam _cache_

### Status HTTP

**Status** | **Deskripsi**
------ | ---------
`200` | API dapat memproses permintaan
`500` | Terdapat data yang tidak tersedia

### Struktur Data

**Nama** | **Tipe Data** | **Deskripsi**
---- | ---- | ---------
`status` | `string` | Mengembalikan nilai `ok` apabila seluruh data mutakhir dalam waktu yang sama dan mengembalikan nilai `not ok` apabila terdapat minimal 1 data yang lebih lawas dibandingkan data-data lainnya.
`version` | `string` | Tanggal terakhir pemuktahiran data dalam format `DD/MM/YYYY`
