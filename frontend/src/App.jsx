import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  Camera,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Image as ImageIcon,
  Loader2,
  LockKeyhole,
  MapPin,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  X,
} from 'lucide-react';
import { io } from 'socket.io-client';
import {
  API_URL,
  fetchPublicAlbum,
  fetchPublicEvent,
  getMediaUrl,
  validateEventAccess,
} from './api';
import { demoAlbums, demoEvent } from './demoData';
import './App.css';

function getInitialSlug() {
  const parts = window.location.pathname.split('/').filter(Boolean);
  const eventIndex = parts.indexOf('events');
  return eventIndex >= 0 ? parts[eventIndex + 1] || '' : '';
}

function getInitialRole() {
  return new URLSearchParams(window.location.search).get('role') || '';
}

function formatDate(value) {
  if (!value) return 'Date a confirmer';

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

function normalizeAlbums(albums) {
  return [...(albums || [])].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

function albumCover(album) {
  return album.coverUrl || album.coverMedia?.publicUrl || album.media?.find((item) => item.type === 'image')?.publicUrl;
}

function isDemoMedia(media) {
  return String(media?.id || '').startsWith('demo-');
}

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
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
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

function App() {
  const [eventSlug] = useState(getInitialSlug);
  const [accessRole] = useState(getInitialRole);
  const [eventData, setEventData] = useState(null);
  const [selectedAlbumSlug, setSelectedAlbumSlug] = useState(null);
  const [albumData, setAlbumData] = useState(null);
  const [accessCode, setAccessCode] = useState('');
  const [pendingCode, setPendingCode] = useState('');
  const [requiresAccessCode, setRequiresAccessCode] = useState(false);
  const [invalidBadge, setInvalidBadge] = useState(false);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  const [isLoadingAlbum, setIsLoadingAlbum] = useState(false);
  const [error, setError] = useState('');
  const [usingDemo, setUsingDemo] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(null);
  const touchStartX = useRef(null);

  const albums = useMemo(() => normalizeAlbums(eventData?.albums), [eventData]);
  const media = albumData?.media || [];
  const imageMedia = media.filter((item) => item.type === 'image');
  const imageCount = imageMedia.length;
  const documents = media.filter((item) => item.type !== 'image');

  const loadEvent = useCallback(
    async (nextAccessCode = accessCode) => {
      if (!eventSlug) {
        setIsLoadingEvent(false);
        return;
      }

      setIsLoadingEvent(true);
      setError('');

      try {
        const data = await fetchPublicEvent(eventSlug, nextAccessCode, accessRole);
        setEventData(data);
        setUsingDemo(false);
        setRequiresAccessCode(false);
        setInvalidBadge(false);
        setSelectedAlbumSlug((current) => current || data.albums?.[0]?.slug || null);
      } catch (loadError) {
        if (loadError.invalidBadge) {
          setInvalidBadge(true);
          setEventData(null);
          setUsingDemo(false);
          setError('');
        } else if (loadError.requiresAccessCode) {
          setRequiresAccessCode(true);
          setEventData(null);
        } else {
          setEventData(demoEvent);
          setUsingDemo(true);
          setSelectedAlbumSlug((current) => current || demoEvent.albums[0]?.slug);
          setError("Aucun evenement publie n'a encore ete trouve. Apercu de demonstration affiche.");
        }
      } finally {
        setIsLoadingEvent(false);
      }
    },
    [accessCode, accessRole, eventSlug],
  );

  const loadAlbum = useCallback(
    async (albumSlug, nextAccessCode = accessCode) => {
      if (!albumSlug) return;

      setIsLoadingAlbum(true);
      setError('');

      try {
        if (usingDemo) {
          setAlbumData(demoAlbums[albumSlug] || demoAlbums[demoEvent.albums[0].slug]);
          return;
        }

        const result = await fetchPublicAlbum(eventSlug, albumSlug, nextAccessCode, accessRole);
        setAlbumData(result.album);
      } catch (loadError) {
        if (loadError.requiresAccessCode) {
          setRequiresAccessCode(true);
        } else {
          setError(loadError.message);
        }
      } finally {
        setIsLoadingAlbum(false);
      }
    },
    [accessCode, accessRole, eventSlug, usingDemo],
  );

  useEffect(() => {
    // The public event is loaded from the backend when the page opens.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadEvent();
  }, [loadEvent]);

  useEffect(() => {
    if (selectedAlbumSlug) {
      // The selected album is synchronized with the current public state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadAlbum(selectedAlbumSlug);
    }
  }, [loadAlbum, selectedAlbumSlug]);

  useEffect(() => {
    if (!eventData?.slug || usingDemo) return undefined;

    const socket = io(API_URL, { transports: ['websocket'] });
    socket.emit('event:join', eventData.slug);
    socket.on('media:created', () => loadAlbum(selectedAlbumSlug));
    socket.on('album:updated', () => loadEvent(accessCode));

    return () => {
      socket.disconnect();
    };
  }, [accessCode, eventData?.slug, loadAlbum, loadEvent, selectedAlbumSlug, usingDemo]);

  const submitAccessCode = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await validateEventAccess(eventSlug, pendingCode);
      setAccessCode(pendingCode);
      setRequiresAccessCode(false);
      await loadEvent(pendingCode);
    } catch (accessError) {
      setError(accessError.message || 'Code invalide');
    }
  };

  const selectAlbum = (albumSlug) => {
    setSelectedAlbumSlug(albumSlug);
    setActiveImageIndex(null);
  };

  const openImage = (mediaItem) => {
    const index = imageMedia.findIndex((item) => item.id === mediaItem.id);
    setActiveImageIndex(index);
  };

  const closeViewer = () => setActiveImageIndex(null);

  const goToImage = useCallback((direction) => {
    setActiveImageIndex((currentIndex) => {
      if (currentIndex === null || imageCount === 0) return currentIndex;
      return (currentIndex + direction + imageCount) % imageCount;
    });
  }, [imageCount]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (activeImageIndex === null) return;
      if (event.key === 'Escape') closeViewer();
      if (event.key === 'ArrowLeft') goToImage(-1);
      if (event.key === 'ArrowRight') goToImage(1);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeImageIndex, goToImage]);

  const activeImage = activeImageIndex !== null ? imageMedia[activeImageIndex] : null;

  const handleQrScan = useCallback((value) => {
    try {
      const scannedUrl = new URL(value, window.location.origin);
      window.location.href = scannedUrl.toString();
    } catch {
      setError('QR code non reconnu. Veuillez rescanner le QR de votre badge.');
    }
  }, []);

  if (isLoadingEvent) {
    return (
      <main className="participant-shell center-state">
        <Loader2 className="animate-spin" size={28} />
        <p>Chargement de l'evenement</p>
      </main>
    );
  }

  if (!eventSlug) {
    return (
      <QrScannerPanel
        title="Scannez votre QR code"
        description="Autorisez la camera puis placez le QR code du badge dans le cadre."
        onScan={handleQrScan}
      />
    );
  }

  if (requiresAccessCode) {
    return (
      <main className="participant-shell access-screen">
        <section className="access-panel">
          <div className="access-icon">
            <LockKeyhole size={24} />
          </div>
          <p className="eyebrow">Evenement protege</p>
          <h1>Entrez le code d'acces</h1>
          <form onSubmit={submitAccessCode} className="access-form">
            <input
              value={pendingCode}
              onChange={(event) => setPendingCode(event.target.value)}
              placeholder="Code d'acces"
              autoFocus
            />
            <button type="submit">Continuer</button>
          </form>
          {error ? <p className="form-error">{error}</p> : null}
        </section>
      </main>
    );
  }

  if (invalidBadge) {
    return (
      <QrScannerPanel
        title="Badge non reconnu"
        description="Ce lien ne correspond pas a un badge actif. Veuillez rescanner le QR code correct."
        onScan={handleQrScan}
      />
    );
  }

  return (
    <main className="participant-shell">
      <header className="event-header">
        <div className="event-meta">
          <span>
            <CalendarDays size={16} />
            {formatDate(eventData?.startsAt)}
          </span>
          {eventData?.location ? (
            <span>
              <MapPin size={16} />
              {eventData.location}
            </span>
          ) : null}
        </div>
        <div className="event-title-row">
          <div>
            <p className="eyebrow">Galerie officielle</p>
            <h1>{eventData?.title}</h1>
            <p className="event-description">{eventData?.description}</p>
          </div>
          <div className="trust-badge">
            <ShieldCheck size={18} />
            Acces direct
          </div>
        </div>
        {usingDemo || error ? (
          <div className="notice">
            <RefreshCw size={16} />
            <span>{error || 'Apercu de demonstration'}</span>
          </div>
        ) : null}
      </header>

      <section className="album-strip" aria-label="Albums">
        {albums.map((album) => (
          <button
            key={album.id || album.slug}
            type="button"
            className={`album-card ${selectedAlbumSlug === album.slug ? 'is-active' : ''}`}
            onClick={() => selectAlbum(album.slug)}
          >
            <span className="album-cover" style={{ backgroundImage: `url("${albumCover(album)}")` }}>
              {!albumCover(album) ? <ImageIcon size={24} /> : null}
            </span>
            <span className="album-card-body">
              <span className="album-card-title">{album.title}</span>
              <span className="album-card-desc">{album.description}</span>
            </span>
          </button>
        ))}
      </section>

      <section className="gallery-section">
        <div className="section-heading">
          <button
            type="button"
            className="back-button"
            onClick={() => setSelectedAlbumSlug(null)}
            disabled={!selectedAlbumSlug}
            title="Retour aux albums"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="eyebrow">Album</p>
            <h2>{albumData?.title || 'Selectionnez un album'}</h2>
          </div>
          {isLoadingAlbum ? <Loader2 className="animate-spin muted-icon" size={20} /> : null}
        </div>

        {albumData?.description ? <p className="album-description">{albumData.description}</p> : null}

        {imageMedia.length > 0 ? (
          <div className="photo-grid">
            {imageMedia.map((item) => (
              <button
                type="button"
                className="photo-tile"
                key={item.id}
                onClick={() => openImage(item)}
              >
                <img
                  src={isDemoMedia(item) ? item.publicUrl : getMediaUrl(item, accessCode, accessRole)}
                  alt={item.originalName}
                  loading="lazy"
                />
                <span>{item.originalName}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <ImageIcon size={28} />
            <p>Aucune photo disponible pour le moment.</p>
          </div>
        )}

        {documents.length > 0 ? (
          <div className="documents-list">
            <div className="documents-title">
              <FileText size={18} />
              Documents
            </div>
            {documents.map((item) => (
              <a
                href={isDemoMedia(item) ? item.downloadUrl : getMediaUrl(item, accessCode, accessRole, 'download')}
                className="document-row"
                key={item.id}
              >
                <span className="document-icon">
                  <FileText size={18} />
                </span>
                <span>{item.originalName}</span>
                <Download size={18} />
              </a>
            ))}
          </div>
        ) : null}
      </section>

      {activeImage ? (
        <div
          className="viewer"
          onTouchStart={(event) => {
            touchStartX.current = event.touches[0].clientX;
          }}
          onTouchEnd={(event) => {
            if (touchStartX.current === null) return;
            const delta = event.changedTouches[0].clientX - touchStartX.current;
            if (Math.abs(delta) > 48) {
              goToImage(delta > 0 ? -1 : 1);
            }
            touchStartX.current = null;
          }}
        >
          <button type="button" className="viewer-close" onClick={closeViewer} title="Fermer">
            <X size={22} />
          </button>
          <button type="button" className="viewer-nav left" onClick={() => goToImage(-1)} title="Precedent">
            <ChevronLeft size={28} />
          </button>
          <img
            src={isDemoMedia(activeImage) ? activeImage.publicUrl : getMediaUrl(activeImage, accessCode, accessRole)}
            alt={activeImage.originalName}
          />
          <button type="button" className="viewer-nav right" onClick={() => goToImage(1)} title="Suivant">
            <ChevronRight size={28} />
          </button>
          <div className="viewer-caption">
            <span>
              {activeImageIndex + 1} / {imageMedia.length}
            </span>
            <strong>{activeImage.originalName}</strong>
            <a
              href={isDemoMedia(activeImage) ? activeImage.publicUrl : getMediaUrl(activeImage, accessCode, accessRole, 'download')}
              title="Telecharger"
            >
              <Download size={18} />
            </a>
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default App;
