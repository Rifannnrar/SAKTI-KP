import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, Box, Clock, Package, QrCode } from 'lucide-react';
import { FlashMessage } from '@/components/flash-message';
import { StatCard } from '@/components/stat-card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Borrowing, Item } from '@/types';

interface Props {
    availableItems: Item[];
    myBorrowings: Borrowing[];
    overdueCount: number;
    pendingInstallationsCount: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

export default function TeknisiDashboard({ 
    availableItems, 
    myBorrowings, 
    overdueCount,
    pendingInstallationsCount 
}: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Teknisi" />
            <FlashMessage />

            <div className="flex flex-col gap-6 p-6">
                {/* Stats Row */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Barang Tersedia"
                        value={availableItems.length}
                        icon={Box}
                    />
                    <StatCard
                        title="Sedang Dipinjam"
                        value={myBorrowings.length}
                        icon={Clock}
                        variant={myBorrowings.length > 0 ? 'warning' : 'default'}
                    />
                    <StatCard
                        title="Pending Approval"
                        value={pendingInstallationsCount}
                        icon={Package}
                        variant={pendingInstallationsCount > 0 ? 'info' : 'default'}
                    />
                    <StatCard
                        title="Terlambat Kembali"
                        value={overdueCount}
                        icon={AlertTriangle}
                        variant={overdueCount > 0 ? 'danger' : 'default'}
                    />
                </div>

                {/* Overdue Alert */}
                {overdueCount > 0 && (
                    <div className="rounded-2xl border-2 border-red-200 bg-red-50/50 p-5 dark:border-red-900/30 dark:bg-red-950/20">
                        <div className="flex items-center gap-4">
                            <div className="flex size-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
                                <AlertTriangle className="size-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="font-black text-red-700 dark:text-red-400 uppercase text-xs tracking-wider">
                                    Peringatan Overdue
                                </h3>
                                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                                    Ada {overdueCount} barang yang harus segera dikembalikan.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <Link
                        href="/teknisi/borrow"
                        className="group flex items-center gap-4 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/30 p-6 transition-all hover:border-blue-400 hover:bg-blue-50 dark:border-blue-900/30 dark:bg-blue-950/10"
                    >
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none transition-transform group-hover:scale-110">
                            <QrCode className="size-7" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black leading-tight">Pinjam Peralatan</h3>
                            <p className="text-xs text-muted-foreground">Scan QR untuk peminjaman alat kerja.</p>
                        </div>
                    </Link>

                    <Link
                        href="/teknisi/install"
                        className="group flex items-center gap-4 rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/30 p-6 transition-all hover:border-purple-400 hover:bg-purple-50 dark:border-purple-900/30 dark:bg-purple-950/10"
                    >
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-lg shadow-purple-200 dark:shadow-none transition-transform group-hover:scale-110">
                            <QrCode className="size-7" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black leading-tight">Pasang Komponen</h3>
                            <p className="text-xs text-muted-foreground">Scan QR untuk pemasangan komponen/asset.</p>
                        </div>
                    </Link>
                </div>

                {/* My Active Borrowings */}
                {myBorrowings.length > 0 && (
                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                        <h3 className="mb-4 text-lg font-semibold">Barang yang Sedang Dipinjam</h3>
                        <div className="space-y-3">
                            {myBorrowings.map((b) => (
                                <div
                                    key={b.id}
                                    className={`flex items-center justify-between rounded-lg border px-4 py-3 ${b.is_overdue
                                            ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950'
                                            : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Box className={`size-5 ${b.is_overdue ? 'text-red-500' : 'text-muted-foreground'}`} />
                                        <div>
                                            <p className="font-medium">{b.item?.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Dipinjam: {new Date(b.borrowed_at).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                        {b.is_overdue && (
                                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900 dark:text-red-300">
                                                TERLAMBAT
                                            </span>
                                        )}
                                    </div>
                                    <Link
                                        href={`/teknisi/return/${b.id}`}
                                        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                                    >
                                        Kembalikan
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Available Items */}
                <div className="rounded-xl border bg-card p-5 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold">Barang Tersedia</h3>
                    {availableItems.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">Tidak ada barang yang tersedia saat ini.</p>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {availableItems.map((item) => (
                                <div key={item.id} className="rounded-lg border p-4 transition-colors hover:bg-muted/30">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-medium">{item.name}</h4>
                                            <p className="text-xs text-muted-foreground">{item.category?.name}</p>
                                        </div>
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                            item.type === 'peralatan'
                                                ? 'bg-blue-100 text-blue-700'
                                                : item.type === 'asset'
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-purple-100 text-purple-700'
                                        }`}>
                                            {item.type === 'peralatan' ? 'Alat' : item.type === 'asset' ? 'Asset' : 'Komponen'}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm">
                                        Stok Tersedia: <span className="font-semibold text-green-600">{item.available_quantity}</span>
                                        <span className="text-muted-foreground"> of {item.quantity}</span>
                                    </p>
                                    {item.is_low_stock && (
                                        <p className="mt-1 flex items-center gap-1 text-[10px] font-bold text-amber-600">
                                            <AlertTriangle className="size-3" /> Stok Menipis
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
