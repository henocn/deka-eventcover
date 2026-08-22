const MAX_SELFIE_SIZE = 1200;
const JPEG_QUALITY = 0.85;
const DIRECT_UPLOAD_MAX_BYTES = 400_000;

// Redimensionne le selfie sur l'appareil pour eviter les erreurs memoire iOS/Safari.
export async function compressSelfie(file) {
  if (!file?.type?.startsWith('image/')) {
    throw new Error('Fichier image requis.');
  }

  if (file.size <= DIRECT_UPLOAD_MAX_BYTES && file.type === 'image/jpeg') {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const longestSide = Math.max(bitmap.width, bitmap.height);
    const scale = Math.min(1, MAX_SELFIE_SIZE / longestSide);
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) {
      bitmap.close();
      throw new Error('Canvas indisponible');
    }

    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error('Compression impossible'))),
        'image/jpeg',
        JPEG_QUALITY,
      );
    });

    return new File([blob], 'selfie.jpg', {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  } catch {
    if (file.size > 8 * 1024 * 1024) {
      throw new Error(
        'Photo trop lourde pour cet appareil. Utilisez "Importer" avec une photo plus legere, ou fermez les autres onglets puis reessayez.',
      );
    }

    return file;
  }
}
