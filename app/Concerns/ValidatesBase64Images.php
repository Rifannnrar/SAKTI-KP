<?php

namespace App\Concerns;

use Illuminate\Validation\ValidationException;

trait ValidatesBase64Images
{
    /**
     * @return array{0: string, 1: string}
     */
    protected function decodeBase64Image(string $base64, int $maxKilobytes = 2048, string $field = 'photo'): array
    {
        $allowedMimes = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
        ];

        $declaredMime = null;
        if (preg_match('/^data:(image\/[a-zA-Z0-9.+-]+);base64,/', $base64, $matches)) {
            $declaredMime = strtolower($matches[1]);
            $base64 = substr($base64, strpos($base64, ',') + 1);
        }

        if ($declaredMime !== null && ! array_key_exists($declaredMime, $allowedMimes)) {
            throw ValidationException::withMessages([
                $field => 'Format gambar harus JPG, PNG, atau WEBP.',
            ]);
        }

        $base64 = preg_replace('/\s+/', '', $base64) ?? '';
        $imageData = base64_decode($base64, true);

        if ($imageData === false || $imageData === '') {
            throw ValidationException::withMessages([
                $field => 'Data gambar tidak valid.',
            ]);
        }

        if (strlen($imageData) > ($maxKilobytes * 1024)) {
            throw ValidationException::withMessages([
                $field => "Ukuran gambar maksimal {$maxKilobytes} KB.",
            ]);
        }

        $imageInfo = @getimagesizefromstring($imageData);
        if ($imageInfo === false || empty($imageInfo['mime']) || ! array_key_exists($imageInfo['mime'], $allowedMimes)) {
            throw ValidationException::withMessages([
                $field => 'File yang dikirim bukan gambar yang valid.',
            ]);
        }

        if ($declaredMime !== null && $declaredMime !== $imageInfo['mime']) {
            throw ValidationException::withMessages([
                $field => 'Format gambar tidak sesuai dengan isi file.',
            ]);
        }

        return [$imageData, $allowedMimes[$imageInfo['mime']]];
    }
}
