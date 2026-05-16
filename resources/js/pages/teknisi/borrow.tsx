import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { ArrowLeft, ArrowRight, Box, Camera, CheckCircle, Package, QrCode, Wrench } from 'lucide-react';
import { useState } from 'react';
import { FlashMessage } from '@/components/flash-message';
import { QrScanner } from '@/components/qr-scanner';
import { WebcamCapture } from '@/components/webcam-capture';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Item } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pinjam / Ambil Barang', href: '/teknisi/borrow' },
];

type Step = 'scan' | 'photo' | 'confirm';

export default function BorrowPage() {
    const [step, setStep] = useState<Step>('scan');
    const [item, setItem] = useState<Item | null>(null);
    const [photo, setPhoto] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [usageNotes, setUsageNotes] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleScan = async (code: string) => {
        setError(null);
        try {
            const response = await axios.post('/teknisi/scan-item', { code });
            
            if (response.data.is_installation_item) {
                // Redirect to installation flow
                router.get(`/teknisi/install?code=${code}`);
                return;
            }

            setItem(response.data.item);
            setStep('photo');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Barang tidak ditemukan.');
        }
    };

    const handlePhoto = (imageBase64: string) => {
        setPhoto(imageBase64);
        setStep('confirm');
    };

    const handleSubmit = () => {
        if (!item || !photo) return;
        setProcessing(true);

        router.post('/teknisi/borrow', {
            item_id: item.id,
            quantity,
            borrow_photo: photo,
        }, {
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pinjam / Ambil Barang" />
            <FlashMessage />

            <div className="p-6">
                <div className="mx-auto max-w-lg">
                    {/* Step indicator */}
                    <div className="mb-6 flex items-center justify-center gap-2">
                        {[
                            { key: 'scan', label: 'Scan QR', icon: QrCode },
                            { key: 'photo', label: 'Foto Dokumentasi', icon: Camera },
                            { key: 'confirm', label: 'Konfirmasi', icon: CheckCircle },
                        ].map((s, i) => (
                            <div key={s.key} className="flex items-center">
                                <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${step === s.key
                                        ? 'bg-primary text-primary-foreground'
                                        : (['scan', 'photo', 'confirm'].indexOf(step) > i)
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-muted text-muted-foreground'
                                    }`}>
                                    <s.icon className="size-3.5" />
                                    {s.label}
                                </div>
                                {i < 2 && <ArrowRight className="mx-1.5 size-3 text-muted-foreground" />}
                            </div>
                        ))}
                    </div>

                    {/* Step 1: Scan QR */}
                    {step === 'scan' && (
                        <div className="space-y-4">
                            <div className="rounded-xl border bg-card p-5 shadow-sm">
                                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                                    <QrCode className="size-5 text-primary" />
                                    Scan QR Code Barang
                                </h2>
                                <QrScanner onScan={handleScan} active />
                            </div>

                            {error && (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Take Photo + Details */}
                    {step === 'photo' && item && (
                        <div className="space-y-4">
                            {/* Item Info with type badge */}
                            <div className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
                                <Wrench className="size-8 text-primary" />
                                <div className="flex-1">
                                    <h3 className="font-semibold">{item.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {item.category?.name} · Tersedia: {item.available_quantity}
                                    </p>
                                </div>
                                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                    Peralatan
                                </span>
                            </div>

                            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
                                <p className="text-sm font-medium text-blue-700">🔧 Mode Peminjaman Peralatan</p>
                                <p className="text-xs text-blue-600">
                                    Peralatan harus dikembalikan dalam 6 jam setelah peminjaman.
                                </p>
                            </div>

                            <div className="rounded-xl border bg-card p-4 shadow-sm">
                                <label className="mb-1.5 block text-sm font-medium">Jumlah Pinjam</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={item.available_quantity}
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                    className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>

                            {/* Camera */}
                            <div className="rounded-xl border bg-card p-5 shadow-sm">
                                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                                    <Camera className="size-5 text-primary" />
                                    Foto Dokumentasi
                                </h2>
                                <p className="mb-3 text-sm text-muted-foreground">
                                    Ambil foto sebagai bukti peminjaman. Timestamp otomatis ditampilkan.
                                </p>
                                <WebcamCapture onCapture={handlePhoto} facingMode="environment" />
                            </div>

                            <button
                                onClick={() => { setStep('scan'); setItem(null); setPhoto(null); setUsageNotes(''); }}
                                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeft className="size-3" /> Kembali ke scan
                            </button>
                        </div>
                    )}

                    {/* Step 3: Confirm */}
                    {step === 'confirm' && item && photo && (
                        <div className="space-y-4">
                            <div className="rounded-xl border bg-card p-5 shadow-sm">
                                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                                    <CheckCircle className="size-5 text-green-600" />
                                    Konfirmasi Peminjaman
                                </h2>

                                <dl className="space-y-2 text-sm">
                                    <div className="flex justify-between border-b pb-2">
                                        <dt className="text-muted-foreground">Barang</dt>
                                        <dd className="font-medium">{item.name}</dd>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <dt className="text-muted-foreground">Jenis</dt>
                                        <dd>
                                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                                Peralatan
                                            </span>
                                        </dd>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <dt className="text-muted-foreground">Kategori</dt>
                                        <dd>{item.category?.name}</dd>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <dt className="text-muted-foreground">Jumlah</dt>
                                        <dd className="font-medium">{quantity}</dd>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <dt className="text-muted-foreground">Kode</dt>
                                        <dd className="font-mono text-xs">{item.code_unique}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">Batas Kembali</dt>
                                        <dd className="font-medium">6 jam</dd>
                                    </div>
                                </dl>

                                <div className="mt-4">
                                    <p className="mb-2 text-sm font-medium">Foto Bukti:</p>
                                    <img src={photo} alt="Bukti" className="w-full rounded-lg border" />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep('photo')}
                                    className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
                                >
                                    Kembali
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={processing}
                                    className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {processing ? 'Memproses...' : 'Konfirmasi Pinjam'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
