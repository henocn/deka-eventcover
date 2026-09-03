import { Image } from 'lucide-react';
import { useEffect, useState } from 'react';
import { API_URL, getToken } from '../../api';


// Affiche une image admin via la vignette WebP uniquement (jamais l'original).
function AdminMediaImage({ media, alt = '', className = '', fallbackClassName = '' }) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    if (!media?.id) {
      return undefined;
    }

    let objectUrl = '';
    let cancelled = false;

    // Charge uniquement la vignette WebP pour l'affichage et l'apercu.
    async function loadPreview() {
      try {
        const response = await fetch(new URL(`/api/admin/media/${media.id}/thumb`, API_URL), {
          headers: { Authorization: `Bearer ${getToken()}` },
        });

        if (!response.ok) {
          if (!cancelled) setSrc('');
          return;
        }

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) setSrc(objectUrl);
      } catch {
        if (!cancelled) setSrc('');
      }
    }

    loadPreview();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [media?.id]);

  if (!src) {
    return (
      <div className={`grid place-items-center bg-neutral-100 text-neutral-500 ${fallbackClassName || className}`}>
        <Image size={22} />
      </div>
    );
  }

  return <img className={className} src={src} alt={alt || media.originalName || ''} loading="lazy" />;
}

export default AdminMediaImage;
