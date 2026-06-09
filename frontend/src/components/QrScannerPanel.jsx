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
    <main className="participant-shell access-screen">
      <section className="access-panel scanner-panel">
        <div className="access-icon">
          <Camera size={24} />
        </div>
        <p className="eyebrow">Scan QR</p>
        <h1>{title}</h1>
        <p className="access-hint">{description}</p>
        <div className="scanner-frame">
          <video ref={videoRef} muted playsInline />
          <ScanLine className="scanner-mark" size={42} />
        </div>
        {scannerError ? <p className="form-error">{scannerError}</p> : null}
      </section>
    </main>
  );
}

export default QrScannerPanel;
