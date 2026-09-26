# _Endpoint `products`_

Melayani seluruh permintaan mengenai produk reksa dana legal yang telah diizinkan oleh Otoritas Jasa Keuangan Republik Indonesia.

## GET - `/api/products`

Cari seluruh produk reksa dana yang telah dinyatakan legal oleh OJK.

### Parameter

| **Nama** | **Tipe Data** | **Deskripsi**                                               |
| -------- | ------------- | ----------------------------------------------------------- |
| `name`   | `string`      | Pola _string_ yang ingin dicari dari nama produk reksa dana |
| `limit`  | `int`         | Jumlah data yang diminta                                    |
| `offset` | `int`         | Indeks pertama dari data yang diminta.                      |

### Status HTTP

| **Status** | **Deskripsi**                                                 |
| ---------- | ------------------------------------------------------------- |
| `200`      | Permintaan berhasil diproses                                  |
| `400`      | Terdapat parameter yang salah atau memiliki nilai yang ilegal |
| `500`      | Data tidak tersedia                                           |

### Struktur Data

| **Nama**     | **Tipe Data** | **Deskripsi**                                                                         |
| ------------ | ------------- | ------------------------------------------------------------------------------------- |
| `id`         | `number`      | Nomor ID produk reksa dana                                                            |
| `name`       | `string`      | Nama produk reksa dana                                                                |
| `management` | `string`      | Pihak pengelola produk reksa dana                                                     |
| `custodian`  | `string`      | [Bank kustodian](https://id.wikipedia.org/wiki/Bank_kustodian) dari produk reksa dana |
| `type`       | `string`      | Jenis reksa dana                                                                      |

## GET - `/api/products/:id`

Cari sebuah produk reksa dana legal yang diizinkan oleh OJK yang memiliki ID yang sama dengan parameter `id`

### Parameter

| **Nama** | **Tipe Data** | **Deskripsi**             |
| -------- | ------------- | ------------------------- |
| `id`     | `number`      | ID dari produk reksa dana |

### Status HTTP

| **Status** | **Deskripsi**                                                 |
| ---------- | ------------------------------------------------------------- |
| `200`      | Permintaan berhasil diproses                                  |
| `400`      | Terdapat parameter yang salah atau memiliki nilai yang ilegal |
| `500`      | Data tidak tersedia                                           |

### Struktur Data

| **Nama**     | **Tipe Data** | **Deskripsi**                                                                         |
| ------------ | ------------- | ------------------------------------------------------------------------------------- |
| `id`         | `number`      | Nomor ID produk reksa dana                                                            |
| `name`       | `string`      | Nama produk reksa dana                                                                |
| `management` | `string`      | Pihak pengelola produk reksa dana                                                     |
| `custodian`  | `string`      | [Bank kustodian](https://id.wikipedia.org/wiki/Bank_kustodian) dari produk reksa dana |
| `type`       | `string`      | Jenis reksa dana                                                                      |
