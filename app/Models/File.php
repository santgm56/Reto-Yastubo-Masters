<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Services\UploadedFileService;

class File extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'disk',
        'path',
        'original_name',
        'mime_type',
        'size',
        'uploaded_by',
        'meta',
    ];

    protected $casts = [
        'size' => 'integer',
        'meta' => 'array',
    ];

    /**
     * Usuario que subió el archivo (si aplica).
     */
    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * URL "normal", basada en UUID, sin expiración.
     * Devuelve null si la ruta no existe.
     */
    public function url(): ?string
    {
        return '/api/v1/files/' . $this->uuid;
    }

    /**
     * URL temporal basada en ID + firma.
     * Por defecto expira en los minutos definidos en config/uploads.php
     * (clave 'temporary_url_minutes', o 1 minuto si no existe).
     */
    public function temporaryUrl(?int $minutes = null): ?string
    {
        $minutes = $minutes ?? config('uploads.temporary_url_minutes', 1);
        $expires = now()->addMinutes($minutes)->timestamp;
        $secret = (string) env('FRONTEND_TEMP_FILE_SECRET', 'change-me-fastapi-file-temp-secret');
        $payload = $this->id . '|' . $expires;
        $signature = hash_hmac('sha256', $payload, $secret);

        return '/api/v1/files/temp/' . $this->id . '?expires=' . $expires . '&signature=' . $signature;
    }

    /**
     * Ruta local absoluta al archivo, usando UploadedFileService
     * (respeta el cache si está activo).
     */
    public function localPath(): string
    {
        /** @var UploadedFileService $service */
        $service = app(UploadedFileService::class);

        return $service->getLocalPath($this);
    }
}
