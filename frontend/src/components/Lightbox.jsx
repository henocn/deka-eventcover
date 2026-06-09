import { ChevronLeft, ChevronRight, Download, X } from 'lucide-react';
import { getMediaUrl } from '../api';
import { isDemoMedia } from '../utils/participantUtils';

function Lightbox({
  activeImage,
  activeImageIndex,
  imageCount,
  accessCode,
  accessRole,
  onClose,
  onGoToImage,
  onTouchStart,
  onTouchEnd,
}) {
  if (!activeImage) return null;

  return (
    <div className="viewer" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <button type="button" className="viewer-close" onClick={onClose} title="Fermer">
        <X size={22} />
      </button>
      <button type="button" className="viewer-nav left" onClick={() => onGoToImage(-1)} title="Precedent">
        <ChevronLeft size={28} />
      </button>
      <img
        src={isDemoMedia(activeImage) ? activeImage.publicUrl : getMediaUrl(activeImage, accessCode, accessRole)}
        alt={activeImage.originalName}
      />
      <button type="button" className="viewer-nav right" onClick={() => onGoToImage(1)} title="Suivant">
        <ChevronRight size={28} />
      </button>
      <div className="viewer-caption">
        <span>{activeImageIndex + 1} / {imageCount}</span>
        <strong>{activeImage.originalName}</strong>
        <a
          href={isDemoMedia(activeImage) ? activeImage.publicUrl : getMediaUrl(activeImage, accessCode, accessRole, 'download')}
          title="Telecharger"
        >
          <Download size={18} />
        </a>
      </div>
    </div>
  );
}

export default Lightbox;
