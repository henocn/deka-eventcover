import { useEffect, useRef, useState } from 'react';
import { Camera, Keyboard, ScanLine, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BrandLogo from './BrandLogo';
import DisplayMessage from './DisplayMessage';
import LanguageToggle from './LanguageToggle';
import PppWatermarks from './PppWatermarks';
import SiteFooter from './SiteFooter';

function QrScannerPanel({ error, title, description, onManualCode, onScan }) {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const [modal, setModal] = useState(null);
  const [scannerError, setScannerError] = useState('');
  const [badgeCode, setBadgeCode] = useState('');

  useEffect(() => {
    if (modal !== 'scan') return undefined;

    let stream;
    let scanIntervalId;
    let isActive = true;

    async function startScanner() {
      setScannerError('');

      if (!('BarcodeDetector' in window)) {
        setScannerError(t('access.scannerUnsupported'));
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });

        const video = videoRef.current;
        if (!video) return;

        video.srcObject = stream;
        await video.play();

        const detector = new window.BarcodeDetector({ formats: ['qr_code'] });

        const scan = async () => {
          if (!isActive || !videoRef.current) return;

          try {
            const codes = await detector.detect(videoRef.current);
            const value = codes[0]?.rawValue;

            if (value) {
              onScan(value);
            }
          } catch {
            setScannerError(t('access.scannerFailed'));
          }
        };

        scanIntervalId = window.setInterval(scan, 100);
        scan();
      } catch {
        setScannerError(t('access.cameraDenied'));
      }
    }

    startScanner();

    return () => {
      isActive = false;
      if (scanIntervalId) window.clearInterval(scanIntervalId);
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, [modal, onScan, t]);

  // Ferme le modal code ou scan et remet a zero les erreurs camera.
  function closeModal() {
    setModal(null);
    setScannerError('');
  }

  // Valide le code badge saisi manuellement.
  function submitBadgeCode(event) {
    event.preventDefault();
    if (badgeCode.length === 6 && onManualCode) onManualCode(badgeCode);
  }

  return (
    <main className="participant-shell participant-shell--landing min-h-svh px-5 py-5 pb-0 text-[var(--text)] max-[680px]:px-3" data-theme="dark">
      <PppWatermarks />
      <div className="participant-shell__content mx-auto flex min-h-[calc(100svh-2.5rem)] w-[min(620px,100%)] flex-col">
        <div className="mb-10 flex items-center justify-between gap-4">
          <BrandLogo />
          <LanguageToggle />
        </div>

        <div className="animate-fade-up flex flex-1 flex-col items-center justify-center text-center">
          <div className="w-full">
            <div className="hero-gallery-title-wrap">
              <h1 className="hero-gallery-title access-page-title">{title}</h1>
            </div>
            <p className="mx-auto mt-4 max-w-[520px] leading-relaxed text-[var(--muted)]">{description}</p>
          </div>

          <div className="mt-8 grid w-full max-w-[520px] grid-cols-2 gap-3 max-[420px]:grid-cols-1">
            <button
              type="button"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-[var(--lime)] bg-[color-mix(in_srgb,var(--modal-bg)_88%,transparent)] px-4 font-black text-[var(--text)] transition hover:-translate-y-0.5 hover:border-[var(--gold)]"
              onClick={() => setModal('code')}
            >
              <Keyboard size={20} />
              {t('common.code')}
            </button>
            <button
              type="button"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-[var(--gold)] bg-[var(--accent)] px-4 font-black text-[var(--accent-ink)] transition hover:-translate-y-0.5 hover:brightness-105"
              onClick={() => setModal('scan')}
            >
              <Camera size={20} />
              {t('common.scan')}
            </button>
          </div>

          {error ? <DisplayMessage message={error} className="participant-modal__error mt-5 block rounded-xl px-4 py-3 font-bold" as="p" /> : null}
        </div>

        <SiteFooter />
      </div>

      {modal ? (
        <div className="participant-modal-overlay fixed inset-0 z-40 grid place-items-center p-4" onMouseDown={closeModal}>
          <section
            className="participant-modal animate-fade-up w-[min(520px,100%)] rounded-2xl p-5"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-[var(--line)] pb-4">
              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-[0.08em] text-[var(--gold-text)]">
                  {modal === 'code' ? t('access.badgeCode') : t('access.scanQr')}
                </p>
                <h2 className="m-0 text-2xl font-black text-[var(--text)]">
                  {modal === 'code' ? t('access.enterCode') : t('access.scanBadge')}
                </h2>
              </div>
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full border-2 border-[var(--line-strong)] bg-[color-mix(in_srgb,var(--modal-bg)_92%,black)] text-[var(--text)] transition hover:border-[var(--accent)]"
                onClick={closeModal}
                title={t('common.close')}
              >
                <X size={18} />
              </button>
            </div>

            {modal === 'code' ? (
              <form className="grid gap-4" onSubmit={submitBadgeCode}>
                <p className="text-sm font-bold leading-relaxed text-[var(--muted)]">
                  {t('access.badgeCodeHint')}
                </p>
                <input
                  className="min-h-14 rounded-2xl border-2 border-[var(--line-strong)] bg-[color-mix(in_srgb,var(--modal-bg)_88%,black)] px-4 text-center text-xl font-black uppercase tracking-[0.24em] text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
                  value={badgeCode}
                  maxLength={6}
                  onChange={(event) => setBadgeCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                  placeholder={t('access.badgeCodePlaceholder')}
                  autoFocus
                />
                <button
                  className="min-h-12 rounded-2xl border-2 border-[var(--gold-deep)] bg-[var(--accent)] px-5 font-black text-[var(--accent-ink)] transition hover:brightness-105"
                  type="submit"
                >
                  {t('common.continue')}
                </button>
              </form>
            ) : null}

            {modal === 'scan' ? (
              <div>
                <div className="relative aspect-square max-h-[420px] overflow-hidden rounded-2xl border-2 border-[var(--line-strong)] bg-black">
                  <video className="h-full w-full object-cover" ref={videoRef} muted playsInline />
                  <ScanLine className="absolute inset-[34px] h-auto w-auto rounded-[18px] border-2 border-[var(--accent)] shadow-[0_0_0_999px_rgba(0,0,0,0.28)]" size={42} />
                </div>
                <p className="mt-3 text-sm font-bold text-[var(--muted)]">{t('access.cameraPrivacy')}</p>
              </div>
            ) : null}

            {scannerError ? <p className="participant-modal__error mt-4 rounded-xl px-4 py-3 font-bold">{scannerError}</p> : null}
          </section>
        </div>
      ) : null}
    </main>
  );
}

export default QrScannerPanel;
