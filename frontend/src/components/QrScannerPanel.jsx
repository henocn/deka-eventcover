import { useEffect, useRef, useState } from 'react';
import { Camera, ScanLine } from 'lucide-react';

function QrScannerPanel({ title, description, onScan }) {
  const videoRef = useRef(null);
  const [scannerError, setScannerError] = useState('');

  useEffect(() => {
    let stream;
    let frameId;
    let isActive = true;

    async function startScanner() {
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
  }, [onScan]);

  return (
    <main className="participant-shell grid min-h-svh place-items-center p-5">
      <section className="animate-fade-up w-[min(480px,100%)] rounded-[32px] border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] p-7 shadow-[var(--shadow)]">
        <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--text)] text-[var(--accent)]">
          <Camera size={24} />
        </div>
        <p className="mb-3 text-xs font-black uppercase tracking-[0.08em] text-[var(--gold)]">Scan QR</p>
        <h1 className="m-0 text-[clamp(1.7rem,5vw,2.4rem)] font-black leading-none">{title}</h1>
        <p className="mt-4 border-l-4 border-[var(--accent)] pl-3 leading-relaxed text-[var(--muted)]">{description}</p>
        <div className="relative my-5 aspect-square overflow-hidden rounded-3xl border border-[var(--line)] bg-black">
          <video className="h-full w-full object-cover" ref={videoRef} muted playsInline />
          <ScanLine className="absolute inset-[34px] h-auto w-auto rounded-[22px] border-2 border-[var(--accent)] shadow-[0_0_0_999px_rgba(0,0,0,0.28)]" size={42} />
        </div>
        {scannerError ? <p className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 font-bold text-red-700">{scannerError}</p> : null}
      </section>
    </main>
  );
}

export default QrScannerPanel;
