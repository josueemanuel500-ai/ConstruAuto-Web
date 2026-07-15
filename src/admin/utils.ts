export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object' && 'message' in err) {
    const m = (err as { message?: unknown }).message;
    if (typeof m === 'string') return m;
  }
  return '';
}

/** Tope amigable de subida (el límite real de Supabase Storage en el plan free es 50 MB). */
export const MAX_UPLOAD_MB = 10;
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

export function fileSizeError(file: File): string | null {
  if (file.size > MAX_UPLOAD_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return `La foto pesa ${sizeMb} MB. El máximo permitido es ${MAX_UPLOAD_MB} MB — comprime la imagen o elige otra.`;
  }
  return null;
}
