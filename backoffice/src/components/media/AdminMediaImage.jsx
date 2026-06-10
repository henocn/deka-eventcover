import { Image } from 'lucide-react';
import { useEffect, useState } from 'react';
import { API_URL, getToken } from '../../api';

function AdminMediaImage({ media, alt = '', className = '', fallbackClassName = '' }) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    if (!media?.id) {
      return undefined;
    }

    let objectUrl = '';
    let cancelled = false;

    async function loadPreview() {
      try {
        const response = await fetch(new URL(`/api/admin/media/${media.id}/file`, API_URL), {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!response.ok) return;
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) setSrc(objectUrl);
      } catch {
        setSrc('');
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

  return <img className={className} src={src} alt={alt || media.originalName || ''} />;
}

export default AdminMediaImage;
