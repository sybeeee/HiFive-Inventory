# HiFive Inventory — Refined Frontend Prototype

Frontend prototype based on the supplied HiFive Inventory HTML, Figma screen references, logo SVG, navigation SVG set, and eight transparent mascot PNGs.

## Run locally

1. Extract the ZIP file.
2. Open the `HiFive_Inventory_Refined` folder in Visual Studio Code.
3. Install the **Live Server** extension if it is not already installed.
4. Right-click `index.html` and choose **Open with Live Server**.
5. The app opens in your browser.

> Use Live Server or another local web server. Do not open only the ZIP file in VS Code.

## Demo accounts

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Gudang | `gudang` | `gudang123` |
| Kasir | `kasir` | `kasir123` |

You can also choose **Buat Akun** from the login screen to register a Gudang or Kasir account. Public registration cannot create an Admin account; Admin access is managed from the Admin user-management screen.

## Updated behavior

- After a successful login, the app opens the **Dashboard** page.
- Desktop sidebar hamburger collapses the sidebar into an icon rail; on smaller screens it opens/closes the drawer.
- Menu-group chevrons expand/collapse menu sections.
- Menu sections start open according to role: **Admin** opens Overview and Preferensi; **Gudang** opens Overview, Kontak, Inventory, and Pembelian; **Kasir** opens Overview, Kontak, and Penjualan. Other sections start collapsed. Users can still expand any section manually.
- Navigation links use the supplied SVG icons in `assets/nav-icons/`.
- Hovering a navigation item animates the pink indicator at the left edge; the active page keeps the indicator visible.
- The bottom-left profile area displays the active username and role. Its chevron opens profile options, and a separate **Logout** control with an exit-door icon is always available below it.
- The top-bar notification bell is a real button. It opens a notification panel; each notification navigates to its related screen, **Tandai dibaca** clears the unread count, and **Lihat semua aktivitas** opens stock history.
- Login, account registration, password visibility, logout, table search, CSV export, notifications, and a small cashier cart/payment demo are interactive.
- Master Data CRUD is implemented for **Barang, Kategori, Satuan, Supplier, and Pengguna** with add, edit, delete, search, filters, pagination, and browser-storage persistence.
- Dashboard and module screens use the HiFive pink/tosca palette and supplied mascot artwork.

## Master Data CRUD

The CRUD screens follow the supplied Figma page structure and use the existing HiFive color palette, sidebar, typography, cards, and table style. The five modules are:

- **Barang:** SKU/code, name, category, unit, supplier, purchase price, sale price, current stock, and minimum stock. The create/edit modal is divided into **Informasi Barang** and **Harga & Persediaan** so all fields are visible without a nested scroll area. Category/unit/supplier choices are loaded from the local master data. Stock status is calculated as Aman, Menipis, or Habis.
- **Kategori:** code, category name, description, created date, and active status.
- **Satuan:** code, unit name, symbol, example/use description, and active status.
- **Supplier:** company/code, contact person, phone, email, city, address, and active status.
- **Pengguna:** full name, username, email, role (Admin/Gudang/Kasir), account status, and password reset. Passwords are hashed locally for the prototype.

Only Admin can add, edit, delete, or reset accounts in these screens. Other roles can view master data in read-only mode; the Pengguna screen is Admin-only. Codes/names are checked for duplicates. Categories, units, and suppliers cannot be deleted while linked to existing products. The last active Admin cannot be deactivated, demoted, or deleted.

### Test the CRUD

1. Sign in using `admin / admin123`.
2. Open **Inventory → Kategori**, add a category, edit it, and try to delete it.
3. Open **Inventory → Satuan**, add a unit and check duplicate code/symbol validation.
4. Open **Kontak → Supplier**, add a supplier with its contact person, phone, and address.
5. Open **Inventory → Barang** and click **Tambah Barang**. The form must show all nine fields: Kode Barang/SKU, Nama Barang, Kategori, Satuan, Supplier, Harga Beli, Harga Jual, Stok Saat Ini, and Batas Minimum Stok. Select the category, unit, and supplier created above, then enter both prices and stock values.
6. Edit the product and verify its displayed stock status. Try to delete its category/unit/supplier; the app should block deletion while the relation is used.
7. Open **Preferensi → Pengguna**, create a Gudang or Kasir account, edit its role/status, and use the reset-password action.
8. Log out and sign in using the newly created account to verify the credentials. A non-Admin account must not be able to modify master data or open Pengguna management.

CRUD records persist in browser `localStorage` under `hifive_master_data_v1`; user accounts remain under `hifive_users`. Clearing browser site data resets the locally stored prototype records.

## Prototype data and authentication note

This is a browser-only frontend prototype. Demo users, locally registered accounts, notification read state, and temporary UI records are stored in browser storage. Passwords are hashed locally for this prototype, but this is **not production authentication**. A production version must authenticate on the server, enforce role permissions on the backend, and read/write through the existing StockPilot/HiFive API and database.

Most table data, notifications, and dashboard metrics are sample data for interface demonstration. The cashier demo does not post transactions to a real database or permanently decrement inventory.

## Project structure

```text
HiFive_Inventory_Refined/
├── index.html
├── styles.css
├── app.js
├── crud.js
├── README.md
└── assets/
    ├── logo/hifive-logo.svg
    ├── mascots/                 # 8 transparent PNG poses
    └── nav-icons/               # supplied navigation SVG icons
```
