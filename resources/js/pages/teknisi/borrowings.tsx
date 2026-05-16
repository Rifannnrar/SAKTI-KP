import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, Box, ClipboardList, Package } from 'lucide-react';
import { FlashMessage } from '@/components/flash-message';
import { Pagination } from '@/components/pagination';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Borrowing, PaginatedResponse } from '@/types';

interface Props {
    borrowings: PaginatedResponse<Borrowing>;
    filters: {
        status?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Riwayat Saya', href: '/teknisi/borrowings' },
];

function getStatusBadge(b: Borrowing) {
    if (b.status === 'digunakan') {
        return { label: 'Digunakan', bg: 'bg-purple-100 text-purple-700', iconBg: 'bg-purple-100 text-purple-600' };
    }
    if (b.status === 'dikembalikan') {
        return { label: 'Dikembalikan', bg: 'bg-green-100 text-green-700', iconBg: 'bg-green-100 text-green-600' };
    }
    return { label: 'Dipinjam', bg: 'bg-amber-100 text-amber-700', iconBg: 'bg-amber-100 text-amber-600' };
}

export default function BorrowingsIndex({ borrowings, filters }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Riwayat Saya" />
            <FlashMessage />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold">Riwayat Peminjaman & Pengambilan</h1>
                    <p className="text-sm text-muted-foreground">Semua riwayat peminjaman peralatan dan penggunaan komponen</p>
                </div>

                {/* Filter */}
                <div className="flex flex-wrap gap-2">
                    {[
                        { label: 'Semua', value: '' },
                        { label: 'Dipinjam', value: 'dipinjam' },
                        { label: 'Dikembalikan', value: 'dikembalikan' },
                        { label: 'Digunakan', value: 'digunakan' },
                    ].map((f) => (
                        <Link
                            key={f.value}
                            href={`/teknisi/borrowings${f.value ? `?status=${f.value}` : ''}`}
                            preserveScroll
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${(filters.status || '') === f.value
                                    ? 'bg-primary text-primary-foreground'
                                    : 'border hover:bg-accent'
                                }`}
                        >
                            {f.label}
                        </Link>
                    ))}
                </div>

                {/* Borrowings List */}
                {borrowings.data.length === 0 ? (
                    <div className="rounded-xl border bg-card p-12 text-center shadow-sm">
                        <ClipboardList className="mx-auto size-12 text-muted-foreground/30" />
                        <p className="mt-3 text-muted-foreground">Belum ada riwayat.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {borrowings.data.map((b) => {
                            const badge = getStatusBadge(b);
                            const isConsumable = b.status === 'digunakan';

                            return (
                                <div
                                    key={b.id}
                                    className={`rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md ${b.is_overdue ? 'border-red-200 dark:border-red-900' : ''
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`flex size-10 items-center justify-center rounded-lg ${badge.iconBg}`}>
                                                {isConsumable ? <Package className="size-5" /> : <Box className="size-5" />}
                                            </div>
                                            <div>
                                                <h3 className="font-medium">{b.item?.name}</h3>
                                                <p className="text-xs text-muted-foreground">
                                                    {b.item?.category?.name} · Jumlah: {b.quantity}
                                                    {isConsumable && ' · Habis Pakai'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {b.is_overdue && (
                                                <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                                                    <AlertTriangle className="size-3" />
                                                    TERLAMBAT
                                                </span>
                                            )}
                                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.bg}`}>
                                                {badge.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Usage notes for consumables */}
                                    {isConsumable && (b as any).usage_notes && (
                                        <div className="mt-2 rounded-lg bg-purple-50 px-3 py-2 dark:bg-purple-950/30">
                                            <p className="text-xs text-purple-700 dark:text-purple-300">
                                                📝 {(b as any).usage_notes}
                                            </p>
                                        </div>
                                    )}

                                    <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                                        <div className="flex gap-4">
                                            <span>
                                                {isConsumable ? 'Diambil' : 'Pinjam'}:{' '}
                                                {new Date(b.borrowed_at).toLocaleString('id-ID')}
                                            </span>
                                            {b.returned_at && (
                                                <span>Kembali: {new Date(b.returned_at).toLocaleString('id-ID')}</span>
                                            )}
                                        </div>
                                        {b.status === 'dipinjam' && (
                                            <Link
                                                href={`/teknisi/return/${b.id}`}
                                                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                                            >
                                                Kembalikan
                                            </Link>
                                        )}
                                        {isConsumable && (
                                            <span className="text-xs font-medium text-purple-600">
                                                Tidak perlu dikembalikan
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <Pagination data={borrowings} />
            </div>
        </AppLayout>
    );
}
