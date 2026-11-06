# HiFive Inventory — Master Data CRUD Test Plan

Scope: Syahra's SPS master-data responsibility (Barang, Kategori, Satuan, Supplier, Pengguna).

## Preconditions
- Run `index.html` through Live Server or another local web server.
- Sign in as `admin / admin123`.
- The prototype stores records in browser `localStorage`; use a fresh browser profile or clear the HiFive site data to return to seed data.

## Functional checks

| ID | Module | Test | Expected result |
|---|---|---|---|
| MD-01 | Kategori | Add a category with a unique code and name | Row appears and total count increases |
| MD-02 | Kategori | Add a duplicate category code or name | Form displays a validation message; no duplicate is saved |
| MD-03 | Kategori | Edit an existing category | Updated values appear in the table and persist after refresh |
| MD-04 | Kategori | Delete a category referenced by an item | Deletion is blocked with a relationship explanation |
| MD-05 | Satuan | Add a unit with code, name, symbol, and use example | Row appears and total count increases |
| MD-06 | Satuan | Reuse a unit code, name, or symbol | Duplicate validation appears |
| MD-07 | Satuan | Delete a unit referenced by an item | Deletion is blocked |
| MD-08 | Supplier | Add supplier with company, contact person, phone, city, and address | Supplier appears in the table |
| MD-09 | Supplier | Enter malformed optional email | Form rejects the invalid email format |
| MD-10 | Supplier | Delete a supplier referenced by an item | Deletion is blocked |
| MD-11 | Barang | Open Tambah Barang and inspect all form fields | Form displays SKU, name, category, unit, supplier, purchase price, sale price, current stock, and minimum stock |
| MD-12 | Barang | Add a product using a category, unit, and supplier | Product appears with linked names, stock, sale price, and calculated stock status |
| MD-13 | Barang | Enter duplicate SKU or product name | Form displays a validation message |
| MD-14 | Barang | Set sale price below purchase price | Form rejects the values |
| MD-15 | Barang | Enter negative or non-numeric price/stock | Form rejects the values |
| MD-16 | Barang | Change stock to 0 / below or equal minimum / above minimum | Status shows Habis / Menipis / Aman respectively |
| MD-17 | Pengguna | Create a user with each supported role | Account is saved and appears with the selected role |
| MD-18 | Pengguna | Reuse a username or email | Duplicate validation appears |
| MD-19 | Pengguna | Create an account with password shorter than 6 chars | Form rejects the password |
| MD-20 | Pengguna | Edit role/status and reset password | Updated account/credential is stored; new password can log in |
| MD-21 | Pengguna | Attempt to delete own account or deactivate/delete last active Admin | Action is blocked |
| MD-22 | All | Search, filter, and paginate records | Table updates to match query/filter/page |
| MD-23 | Access | Sign in as Gudang or Kasir and open master data | Data is read-only; add/edit/delete controls are unavailable |
| MD-24 | Persistence | Refresh a CRUD page after add/edit/delete | Stored data remains consistent |

## Important implementation boundary
This is a browser prototype. CRUD data is currently persisted in `localStorage`, not MySQL. Production use requires server-side authentication, role authorization, API endpoints, and database transactions/foreign keys.
