import { Image } from 'lucide-react';
import { useEffect, useState } from 'react';
import { API_URL, getToken } from '../../api';

function AdminMediaImage({ media, alt = '', className = '', fallbackClassName = '', variant = 'thumb' }) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    if (!media?.id) {
      return undefined;
    }

    let objectUrl = '';
    let cancelled = false;
    const endpoint = variant === 'full' ? 'file' : 'thumb';

    async function loadPreview() {
      async function fetchVariant(variantName) {
        const response = await fetch(new URL(`/api/admin/media/${media.id}/${variantName}`, API_URL), {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!response.ok) return null;
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      }

      try {
        objectUrl = await fetchVariant(endpoint);

        if (!objectUrl && endpoint === 'thumb') {
          objectUrl = await fetchVariant('file');
        }

        if (!cancelled) setSrc(objectUrl || '');
      } catch {
        if (!cancelled) setSrc('');
      }
    }

    loadPreview();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [media?.id, variant]);

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
