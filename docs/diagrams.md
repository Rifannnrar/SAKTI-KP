# Diagram SAKTI

Dokumen ini berisi block diagram, flowchart, dan use case diagram untuk aplikasi SAKTI.
Diagram dibuat dalam format Mermaid agar mudah dirender di Markdown, VS Code, GitHub, atau dokumentasi teknis.

## 1. Block Diagram Sistem

```mermaid
flowchart TB
    subgraph Client["Client"]
        Browser["Web Browser"]
        Camera["Kamera / Webcam"]
    end

    subgraph Frontend["Frontend"]
        React["React 19 + TypeScript"]
        Inertia["Inertia.js"]
        Tailwind["TailwindCSS + Radix UI"]
        QRScanner["QR Scanner jsQR"]
    end

    subgraph Backend["Backend Laravel"]
        Routes["Web Routes"]
        Auth["Fortify Auth + Email Verification + 2FA"]
        Middleware["Auth, Verified, Admin Middleware"]
        Controllers["Controllers"]
        Models["Eloquent Models"]
        Notifications["Notifications"]
        Exports["Excel / PDF Export"]
        QRGen["QR Code Generator"]
    end

    subgraph Storage["Storage"]
        PublicStorage["Public Storage: item images, QR codes"]
        ProtectedMedia["Protected Media Routes: borrow/install photos"]
        BADocs["Berita Acara Files"]
    end

    subgraph Data["Data Layer"]
        PostgreSQL["PostgreSQL"]
        Redis["Redis Cache / Session / Queue"]
    end

    subgraph Deployment["Deployment"]
        Nginx["Nginx"]
        PHPFPM["PHP-FPM"]
        Docker["Docker Compose"]
    end

    Browser --> React
    Camera --> QRScanner
    React --> Inertia
    Tailwind --> React
    QRScanner --> React
    Inertia --> Routes
    Routes --> Middleware
    Middleware --> Auth
    Middleware --> Controllers
    Controllers --> Models
    Controllers --> Notifications
    Controllers --> Exports
    Controllers --> QRGen
    Controllers --> PublicStorage
    Controllers --> ProtectedMedia
    Controllers --> BADocs
    Models --> PostgreSQL
    Notifications --> Redis
    Auth --> PostgreSQL
    Nginx --> PHPFPM
    PHPFPM --> Backend
    Docker --> Nginx
    Docker --> PostgreSQL
    Docker --> Redis
```

## 2. Flowchart Login dan Akses Role

```mermaid
flowchart TD
    Start([Mulai]) --> OpenApp[Buka aplikasi SAKTI]
    OpenApp --> HasSession{Sudah login?}
    HasSession -- Tidak --> LoginPage[Halaman login]
    LoginPage --> SubmitLogin[Input email dan password]
    SubmitLogin --> ValidLogin{Kredensial valid?}
    ValidLogin -- Tidak --> LoginError[Tampilkan error login]
    LoginError --> LoginPage
    ValidLogin -- Ya --> Verified{Email verified?}
    Verified -- Tidak --> VerifyEmail[Halaman verifikasi email]
    VerifyEmail --> LoginPage
    Verified -- Ya --> TwoFactor{2FA aktif?}
    TwoFactor -- Ya --> TwoFactorPage[Input kode 2FA]
    TwoFactorPage --> TwoFactorValid{Kode valid?}
    TwoFactorValid -- Tidak --> TwoFactorPage
    TwoFactorValid -- Ya --> CheckRole{Role user}
    TwoFactor -- Tidak --> CheckRole
    CheckRole -- Admin --> AdminDashboard[Dashboard Admin]
    CheckRole -- Teknisi --> TeknisiDashboard[Dashboard Teknisi]
    AdminDashboard --> End([Selesai])
    TeknisiDashboard --> End
```

## 3. Flowchart Peminjaman Peralatan

```mermaid
flowchart TD
    Start([Mulai]) --> TeknisiLogin[Teknisi login]
    TeknisiLogin --> BorrowPage[Buka menu peminjaman]
    BorrowPage --> ScanQR[Scan QR Code barang]
    ScanQR --> ItemFound{Barang ditemukan?}
    ItemFound -- Tidak --> NotFound[Tampilkan barang tidak ditemukan]
    NotFound --> ScanQR
    ItemFound -- Ya --> CheckType{Jenis barang}
    CheckType -- Komponen / Asset --> RedirectInstall[Arahkan ke pengajuan pemasangan]
    CheckType -- Peralatan --> CheckStock{Stok tersedia cukup?}
    CheckStock -- Tidak --> StockError[Tampilkan stok tidak cukup]
    StockError --> ScanQR
    CheckStock -- Ya --> CapturePhoto[Ambil foto bukti pinjam]
    CapturePhoto --> SubmitBorrow[Kirim data peminjaman]
    SubmitBorrow --> ValidatePhoto{Foto valid dan ukuran sesuai?}
    ValidatePhoto -- Tidak --> PhotoError[Tampilkan error foto]
    PhotoError --> CapturePhoto
    ValidatePhoto -- Ya --> SaveBorrowing[Simpan log peminjaman]
    SaveBorrowing --> SetDueTime[Set batas pengembalian 6 jam]
    SetDueTime --> Dashboard[Kembali ke dashboard teknisi]
    Dashboard --> End([Selesai])
```

## 4. Flowchart Pengembalian Peralatan

```mermaid
flowchart TD
    Start([Mulai]) --> OpenBorrowings[Buka peminjaman aktif]
    OpenBorrowings --> SelectBorrowing[Pilih barang yang akan dikembalikan]
    SelectBorrowing --> OwnershipCheck{Milik teknisi ini atau admin?}
    OwnershipCheck -- Tidak --> Forbidden[Akses ditolak]
    OwnershipCheck -- Ya --> ReturnPage[Halaman pengembalian]
    ReturnPage --> CaptureReturnPhoto[Ambil foto bukti kembali]
    CaptureReturnPhoto --> SubmitReturn[Kirim pengembalian]
    SubmitReturn --> ValidatePhoto{Foto valid dan ukuran sesuai?}
    ValidatePhoto -- Tidak --> PhotoError[Tampilkan error foto]
    PhotoError --> CaptureReturnPhoto
    ValidatePhoto -- Ya --> UpdateBorrowing[Update status menjadi dikembalikan]
    UpdateBorrowing --> SetReturnedAt[Set waktu pengembalian]
    SetReturnedAt --> Dashboard[Kembali ke dashboard]
    Dashboard --> End([Selesai])
```

## 5. Flowchart Pengajuan Pemasangan Komponen / Asset

```mermaid
flowchart TD
    Start([Mulai]) --> TeknisiLogin[Teknisi login]
    TeknisiLogin --> InstallPage[Buka menu pengajuan pemasangan]
    InstallPage --> SelectItem[Pilih atau scan barang]
    SelectItem --> CheckType{Jenis barang}
    CheckType -- Peralatan --> TypeError[Arahkan ke alur peminjaman]
    CheckType -- Komponen / Asset --> CheckStock{Stok tersedia cukup?}
    CheckStock -- Tidak --> StockError[Tampilkan stok tidak cukup]
    CheckStock -- Ya --> FillForm[Isi jumlah, lokasi, catatan, dan foto]
    FillForm --> ValidateForm{Data valid?}
    ValidateForm -- Tidak --> FormError[Tampilkan error validasi]
    FormError --> FillForm
    ValidateForm -- Ya --> SaveRequest[Simpan pengajuan pemasangan]
    SaveRequest --> Pending[Status menunggu approval]
    Pending --> AdminReview[Admin meninjau pengajuan]
    AdminReview --> AdminDecision{Keputusan admin}
    AdminDecision -- Tolak --> Rejected[Status ditolak dan simpan alasan]
    AdminDecision -- Setuju --> Approved[Status disetujui]
    Approved --> ReduceAvailableStock[Stok tersedia berkurang]
    Approved --> RecordHistory[Catat histori stok]
    Rejected --> End([Selesai])
    RecordHistory --> End
```

## 6. Flowchart Berita Acara

```mermaid
flowchart TD
    Start([Mulai]) --> UserLogin[User login]
    UserLogin --> OpenBA[Buka menu Berita Acara]
    OpenBA --> ChooseAction{Pilih aksi}
    ChooseAction -- Upload dokumen --> UploadFile[Upload PDF / DOC / DOCX]
    UploadFile --> ValidateUpload{File valid dan maksimal 2 MB?}
    ValidateUpload -- Tidak --> UploadError[Tampilkan error upload]
    ValidateUpload -- Ya --> SaveUpload[Simpan dokumen BA]
    ChooseAction -- Generate PDF --> OpenGenerateForm[Buka form generate BA]
    OpenGenerateForm --> FillGenerateData[Isi judul, jenis, nomor, teknisi, manager, lokasi]
    FillGenerateData --> HasReference{Ada reference pemasangan / peminjaman?}
    HasReference -- Ya --> CheckReferenceAccess{User boleh mengakses reference?}
    CheckReferenceAccess -- Tidak --> Forbidden[Akses ditolak]
    CheckReferenceAccess -- Ya --> GeneratePDF[Generate PDF BA]
    HasReference -- Tidak --> GeneratePDF
    GeneratePDF --> SaveGeneratedBA[Simpan file dan metadata BA]
    SaveGeneratedBA --> ListBA[Tampilkan daftar BA]
    SaveUpload --> ListBA
    ListBA --> DownloadBA[Download lewat route terproteksi]
    DownloadBA --> End([Selesai])
```

## 7. Use Case Diagram

```mermaid
flowchart LR
    Admin((Admin))
    Teknisi((Teknisi))

    subgraph Auth["Autentikasi"]
        UCLogin["Login"]
        UCLogout["Logout"]
        UCVerify["Verifikasi Email"]
        UC2FA["Kelola 2FA"]
        UCProfile["Kelola Profil"]
    end

    subgraph Inventory["Inventaris"]
        UCViewDashboard["Lihat Dashboard"]
        UCManageItems["Kelola Barang"]
        UCManageCategories["Kelola Kategori"]
        UCViewQR["Lihat / Cetak QR Code"]
        UCExportItems["Export Excel / PDF"]
        UCAuditStock["Lihat Audit Stok"]
        UCStockAnalytics["Lihat Analitik Stok"]
    end

    subgraph Borrowing["Peminjaman Peralatan"]
        UCScanBorrow["Scan QR Barang"]
        UCBorrowItem["Pinjam Peralatan"]
        UCReturnItem["Kembalikan Peralatan"]
        UCViewOwnBorrowings["Lihat Riwayat Peminjaman Sendiri"]
        UCManageBorrowings["Kelola Semua Peminjaman"]
    end

    subgraph Installation["Pemasangan Komponen / Asset"]
        UCRequestInstall["Ajukan Pemasangan"]
        UCViewOwnInstall["Lihat Riwayat Pemasangan Sendiri"]
        UCApproveInstall["Approve Pemasangan"]
        UCRejectInstall["Tolak Pemasangan"]
        UCManageInstall["Kelola Semua Pemasangan"]
    end

    subgraph BA["Berita Acara"]
        UCUploadBA["Upload Berita Acara"]
        UCGenerateBA["Generate PDF Berita Acara"]
        UCDownloadBA["Download Berita Acara"]
        UCDeleteBA["Hapus Berita Acara"]
    end

    subgraph Notification["Notifikasi"]
        UCReadNotif["Baca Notifikasi"]
        UCMarkNotif["Tandai Notifikasi Dibaca"]
    end

    Admin --> UCLogin
    Admin --> UCLogout
    Admin --> UCVerify
    Admin --> UC2FA
    Admin --> UCProfile
    Admin --> UCViewDashboard
    Admin --> UCManageItems
    Admin --> UCManageCategories
    Admin --> UCViewQR
    Admin --> UCExportItems
    Admin --> UCAuditStock
    Admin --> UCStockAnalytics
    Admin --> UCManageBorrowings
    Admin --> UCManageInstall
    Admin --> UCApproveInstall
    Admin --> UCRejectInstall
    Admin --> UCUploadBA
    Admin --> UCGenerateBA
    Admin --> UCDownloadBA
    Admin --> UCDeleteBA
    Admin --> UCReadNotif
    Admin --> UCMarkNotif

    Teknisi --> UCLogin
    Teknisi --> UCLogout
    Teknisi --> UCVerify
    Teknisi --> UC2FA
    Teknisi --> UCProfile
    Teknisi --> UCViewDashboard
    Teknisi --> UCScanBorrow
    Teknisi --> UCBorrowItem
    Teknisi --> UCReturnItem
    Teknisi --> UCViewOwnBorrowings
    Teknisi --> UCRequestInstall
    Teknisi --> UCViewOwnInstall
    Teknisi --> UCUploadBA
    Teknisi --> UCGenerateBA
    Teknisi --> UCDownloadBA
    Teknisi --> UCReadNotif
    Teknisi --> UCMarkNotif
```

## 8. Use Case Ringkas

| Aktor | Use Case Utama |
| --- | --- |
| Admin | Mengelola barang, kategori, peminjaman, pemasangan, audit stok, analitik stok, export, dan berita acara |
| Teknisi | Melihat dashboard, scan QR, meminjam peralatan, mengembalikan peralatan, mengajukan pemasangan, dan mengelola berita acara miliknya |
| Sistem | Autentikasi, validasi role, generate QR, validasi upload, mencatat histori, mengirim notifikasi, dan membuat file PDF/Excel |

