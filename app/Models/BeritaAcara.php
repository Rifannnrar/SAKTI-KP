<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BeritaAcara extends Model
{
    use HasFactory;

    protected $table = 'berita_acara';

    protected $fillable = [
        'user_id',
        'nomor_ba',
        'title',
        'type',
        'description',
        'file_path',
        'file_name',
        'file_size',
        'signer_name',
        'manager_name',
        'location',
        'signature_path',
        'reference_id',
        'reference_type',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (self $ba) {
            if (empty($ba->nomor_ba)) {
                $ba->nomor_ba = self::generateNomor($ba->type);
            }
        });
    }

    /**
     * Generate nomor BA — hanya sequence number, sisanya diisi manual.
     * Format: BAC.XXX (contoh: BAC.047)
     * Bagian lengkap diisi manual oleh user.
     */
    public static function generateNomor(string $type): string
    {
        $year = now()->year;

        // Hitung sequence per tipe per tahun
        $count = self::where('type', $type)
            ->whereYear('created_at', $year)
            ->count() + 1;

        $seq = str_pad($count, 3, '0', STR_PAD_LEFT);

        return "BAC.{$seq}";
    }

    public function reference()
    {
        return $this->morphTo();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getTypeLabelAttribute(): string
    {
        return match ($this->type) {
            'pemasangan' => 'Pemasangan',
            'pelepasan' => 'Pelepasan',
            'serah_terima' => 'Serah Terima',
            default => $this->type,
        };
    }

    public function getFormattedSizeAttribute(): string
    {
        $bytes = $this->file_size;

        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 1) . ' MB';
        }

        if ($bytes >= 1024) {
            return number_format($bytes / 1024, 1) . ' KB';
        }

        return "{$bytes} B";
    }
}
