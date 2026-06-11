import { useEffect, useRef, useState } from 'react';
import { Camera, Keyboard, ScanLine, X } from 'lucide-react';

function QrScannerPanel({ error, title, description, onManualCode, onScan }) {
  const videoRef = useRef(null);
  const [modal, setModal] = useState(null);
  const [scannerError, setScannerError] = useState('');
  const [badgeCode, setBadgeCode] = useState('');

  useEffect(() => {
    if (modal !== 'scan') return undefined;

    let stream;
    let frameId;
    let isActive = true;

    async function startScanner() {
      setScannerError('');

      if (!('BarcodeDetector' in window)) {
        setScannerError("Ce navigateur ne supporte pas encore le scan QR integre. Ouvrez le lien QR avec l'appareil photo du telephone.");
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
              return;
            }
          } catch {
            setScannerError('Scan impossible pour le moment. Repositionnez le QR code ou rescanner avec la camera du telephone.');
          }

          frameId = window.requestAnimationFrame(scan);
        };

        frameId = window.requestAnimationFrame(scan);
      } catch {
        setScannerError("Autorisez l'acces a la camera pour scanner le QR code.");
      }
    }

    startScanner();

    return () => {
      isActive = false;
      if (frameId) window.cancelAnimationFrame(frameId);
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, [modal, onScan]);

  function closeModal() {
    setModal(null);
    setScannerError('');
  }

  function submitBadgeCode(event) {
    event.preventDefault();
    if (badgeCode.length === 6 && onManualCode) onManualCode(badgeCode);
  }

  return (
    <main
      className="participant-shell grid min-h-svh place-items-center p-5"
      style={{ background: 'linear-gradient(135deg, #003c28 0%, #062f2c 46%, #082936 100%)' }}
    >
      <section className="animate-fade-up w-[min(620px,100%)] rounded-2xl border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] p-6 shadow-[var(--shadow)] border border-3 border-black">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center overflow-hidden rounded-2xl border border-[var(--line-strong)] bg-white shadow-sm">
          <img className="h-full w-full object-contain bg-" src="/favicon.png" alt="Logo evenement" />
        </div>

        <div className="mx-auto max-w-[520px] text-center">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.1em] text-[var(--gold)]">Acces participant</p>
          <h1 className="m-0 text-[clamp(2rem,5vw,3.2rem)] font-black leading-none">{title}</h1>
          <p className="mt-4 leading-relaxed text-[var(--muted)]">{description}</p>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3">
          <button
            type="button"
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-[#79c705] bg-[var(--surface)] px-4 font-black text-[var(--text)] transition hover:-translate-y-0.5"
            onClick={() => setModal('code')}
          >
            <Keyboard size={20} />
            Code
          </button>
          <button
            type="button"
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-black bg-gray-300 px-4 font-black text-[var(--text)] transition hover:-translate-y-0.5"
            onClick={() => setModal('scan')}
          >
            <Camera size={20} />
            Scan
          </button>
        </div>

        {error ? <p className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 font-bold text-red-700">{error}</p> : null}
      </section>

      {modal ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/45 p-4" onMouseDown={closeModal}>
          <section
            className="animate-fade-up w-[min(520px,100%)] rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.28)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-[var(--line)] pb-4">
              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-[0.08em] text-[var(--gold)]">
                  {modal === 'code' ? 'Code badge' : 'Scan QR'}
                </p>
                <h2 className="m-0 text-2xl font-black">
                  {modal === 'code' ? 'Entrer le code' : 'Scanner le badge'}
                </h2>
              </div>
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full border-2 border-[var(--line-strong)] bg-[var(--surface)] text-[var(--text)] transition hover:border-[var(--accent)]"
                onClick={closeModal}
                title="Fermer"
              >
                <X size={18} />
              </button>
            </div>

            {modal === 'code' ? (
              <form className="grid gap-4" onSubmit={submitBadgeCode}>
                <p className="text-sm font-bold leading-relaxed text-[var(--muted)]">
                  Entrez les 6 caracteres inscrits sur votre badge.
                </p>
                <input
                  className="min-h-14 rounded-2xl border-2 border-[var(--line-strong)] bg-[var(--surface-strong)] px-4 text-center text-xl font-black uppercase tracking-[0.24em] text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
                  value={badgeCode}
                  maxLength={6}
                  onChange={(event) => setBadgeCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                  placeholder="A7K9P2"
                  autoFocus
                />
                <button
                  className="min-h-12 rounded-2xl border-2 border-black bg-[var(--text)] px-5 font-black text-[var(--bg)] transition hover:border-[var(--accent)]"
                  type="submit"
                >
                  Continuer
                </button>
              </form>
            ) : null}

            {modal === 'scan' ? (
              <div>
                <div className="relative aspect-square max-h-[420px] overflow-hidden rounded-2xl border-2 border-[var(--line-strong)] bg-black">
                  <video className="h-full w-full object-cover" ref={videoRef} muted playsInline />
                  <ScanLine className="absolute inset-[34px] h-auto w-auto rounded-[18px] border-2 border-[var(--accent)] shadow-[0_0_0_999px_rgba(0,0,0,0.28)]" size={42} />
                </div>
                <p className="mt-3 text-sm font-bold text-[var(--muted)]">Autorisez uniquement l'acces camera. Aucune video n'est enregistree.</p>
              </div>
            ) : null}

            {scannerError ? <p className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 font-bold text-red-700">{scannerError}</p> : null}
          </section>
        </div>
      ) : null}
    </main>
  );
}

export default QrScannerPanel;
