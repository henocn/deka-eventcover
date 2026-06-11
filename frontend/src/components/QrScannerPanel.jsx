import { useEffect, useRef, useState } from 'react';
import { Camera, Keyboard, ScanLine, ShieldCheck } from 'lucide-react';

function QrScannerPanel({ error, title, description, onManualCode, onScan }) {
  const videoRef = useRef(null);
  const [mode, setMode] = useState(null);
  const [scannerError, setScannerError] = useState('');
  const [badgeCode, setBadgeCode] = useState('');

  useEffect(() => {
    if (mode !== 'scan') return undefined;

    let stream;
    let frameId;
    let isActive = true;

    async function startScanner() {
      setScannerError('');

      if (!('BarcodeDetector' in window)) {
        setScannerError("Ce navigateur ne supporte pas encore le scan QR integre. Utilisez pluôt le code manuel.");
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
  }, [mode, onScan]);

  function submitBadgeCode(event) {
    event.preventDefault();
    if (badgeCode.length === 6 && onManualCode) onManualCode(badgeCode);
  }

  return (
    <main className="participant-shell grid min-h-svh place-items-center p-5">
      <section className="animate-fade-up w-[min(760px,100%)] rounded-[30px] border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] p-5 shadow-[var(--shadow)] max-[640px]:p-4">
        <div className="mb-6 flex items-start justify-between gap-4 max-[640px]:flex-col">
          <div>
            <p className="mb-3 text-xl font-black uppercase tracking-[0.08em] text-[var(--gold)]">{title}</p>
            <p className="mt-4 leading-relaxed text-[var(--muted)]">{description}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 max-[640px]:grid-cols-1">
          <button
            type="button"
            className={`rounded-2xl border-2 p-4 text-left transition hover:-translate-y-0.5 hover:border-[var(--accent)] ${mode === 'code' ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_14%,var(--surface))]' : 'border-[var(--line-strong)] bg-[var(--surface)]'}`}
            onClick={() => setMode('code')}
          >
            <span className="mb-4 grid h-11 w-11 place-items-center rounded-full bg-[var(--text)] text-[var(--accent)]">
              <Keyboard size={20} />
            </span>
            <strong className="block text-lg font-black text-[var(--text)]">Entrer mon code</strong>
            <span className="mt-1 block text-sm font-bold text-[var(--muted)]">Utilisez le code a 6 caracteres inscrit sur votre badge.</span>
          </button>

          <button
            type="button"
            className={`rounded-2xl border-2 p-4 text-left transition hover:-translate-y-0.5 hover:border-[var(--accent)] ${mode === 'scan' ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_14%,var(--surface))]' : 'border-[var(--line-strong)] bg-[var(--surface)]'}`}
            onClick={() => setMode('scan')}
          >
            <span className="mb-4 grid h-11 w-11 place-items-center rounded-full bg-[var(--text)] text-[var(--accent)]">
              <Camera size={20} />
            </span>
            <strong className="block text-lg font-black text-[var(--text)]">Scanner le QR</strong>
            <span className="mt-1 block text-sm font-bold text-[var(--muted)]">La camera est demandée uniquement pour lire le QR.</span>
          </button>
        </div>

        {mode === 'code' ? (
          <form className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4" onSubmit={submitBadgeCode}>
            <label className="text-sm font-black text-[var(--text)]">Code badge</label>
            <div className="mt-2 flex gap-2 max-[520px]:flex-col">
              <input
                className="min-h-12 min-w-0 flex-1 rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 text-center font-black uppercase tracking-[0.22em] text-[var(--text)]"
                value={badgeCode}
                maxLength={6}
                onChange={(event) => setBadgeCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                placeholder="A7K9P2"
                autoFocus
              />
              <button className="min-h-12 rounded-2xl border-2 border-[var(--line-strong)] bg-[var(--text)] px-5 font-black text-[var(--bg)] transition hover:border-[var(--accent)]" type="submit">
                Continuer
              </button>
            </div>
          </form>
        ) : null}

        {mode === 'scan' ? (
          <div className="mt-5">
            <div className="relative aspect-square max-h-[460px] overflow-hidden rounded-3xl border border-[var(--line)] bg-black">
              <video className="h-full w-full object-cover" ref={videoRef} muted playsInline />
              <ScanLine className="absolute inset-[34px] h-auto w-auto rounded-[22px] border-2 border-[var(--accent)] shadow-[0_0_0_999px_rgba(0,0,0,0.28)]" size={42} />
            </div>
            <p className="mt-3 text-sm font-bold text-[var(--muted)]">Placez simplement le QR dans le cadre. Aucune video n'est enregistree.</p>
          </div>
        ) : null}

        {scannerError || error ? <p className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 font-bold text-red-700">{scannerError || error}</p> : null}
      </section>
    </main>
  );
}

export default QrScannerPanel;
