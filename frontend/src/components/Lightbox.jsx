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
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-6 animate-fade-in" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <button type="button" className="fixed right-5 top-5 z-[2] grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:-translate-y-0.5" onClick={onClose} title="Fermer">
        <X size={22} />
      </button>
      <button type="button" className="fixed left-5 top-1/2 z-[2] grid h-[52px] w-[52px] -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:scale-105 max-[680px]:top-auto max-[680px]:bottom-20 max-[680px]:translate-y-0" onClick={() => onGoToImage(-1)} title="Precedent">
        <ChevronLeft size={28} />
      </button>
      <img
        className="max-h-[78vh] max-w-[min(1120px,92vw)] rounded-[14px] object-contain shadow-[0_34px_100px_rgba(0,0,0,0.45)]"
        src={isDemoMedia(activeImage) ? activeImage.publicUrl : getMediaUrl(activeImage, accessCode, accessRole)}
        alt={activeImage.originalName}
      />
      <button type="button" className="fixed right-5 top-1/2 z-[2] grid h-[52px] w-[52px] -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:scale-105 max-[680px]:top-auto max-[680px]:bottom-20 max-[680px]:translate-y-0" onClick={() => onGoToImage(1)} title="Suivant">
        <ChevronRight size={28} />
      </button>
      <div className="fixed bottom-5 left-1/2 flex min-h-11 max-w-[min(720px,calc(100vw-44px))] -translate-x-1/2 items-center gap-4 rounded-full border border-white/20 bg-white/10 px-4 font-black text-white backdrop-blur">
        <span>{activeImageIndex + 1} / {imageCount}</span>
        <a
          className="grid h-9 w-9 place-items-center rounded-full border border-white/25 text-white transition hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--accent-ink)]"
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
