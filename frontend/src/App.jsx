import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  API_URL,
  fetchPublicAlbum,
  fetchPublicEvent,
  getMediaUrl,
  validateEventAccess,
} from './api';
import AccessGate from './components/AccessGate';
import AlbumRail from './components/AlbumRail';
import EventHero from './components/EventHero';
import GalleryView from './components/GalleryView';
import Lightbox from './components/Lightbox';
import QrScannerPanel from './components/QrScannerPanel';
import { demoAlbums, demoEvent } from './demoData';
import {
  getInitialRole,
  isDemoMedia,
  normalizeAlbums,
} from './utils/participantUtils';
import './App.css';

function App() {
  const { albumSlug, eventSlug: routeEventSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const eventSlug = routeEventSlug || '';
  const [accessRole] = useState(getInitialRole);
  const [theme, setTheme] = useState(() => window.localStorage.getItem('deka.participant.theme') || 'light');
  const [eventData, setEventData] = useState(null);
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
  const [selectedMediaIds, setSelectedMediaIds] = useState([]);
  const touchStartX = useRef(null);

  const selectedAlbumSlug = albumSlug || null;
  const albums = useMemo(() => normalizeAlbums(eventData?.albums), [eventData]);
  const media = albumData?.media || [];
  const imageMedia = media.filter((item) => item.type === 'image');
  const documents = media.filter((item) => item.type !== 'image');
  const activeImage = activeImageIndex !== null ? imageMedia[activeImageIndex] : null;

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
    if (!selectedAlbumSlug) {
      queueMicrotask(() => {
        setAlbumData(null);
        setActiveImageIndex(null);
        setSelectedMediaIds([]);
      });
      return;
    }

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
    socket.on('media:created', () => {
      if (selectedAlbumSlug) loadAlbum(selectedAlbumSlug);
    });
    socket.on('album:updated', () => loadEvent(accessCode));

    return () => socket.disconnect();
  }, [accessCode, eventData?.slug, loadAlbum, loadEvent, selectedAlbumSlug, usingDemo]);

  useEffect(() => {
    window.localStorage.setItem('deka.participant.theme', theme);
  }, [theme]);

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

  const toggleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'));

  const selectAlbum = (albumSlug) => {
    setAlbumData(null);
    setActiveImageIndex(null);
    setSelectedMediaIds([]);
    navigate(`/events/${eventSlug}/albums/${albumSlug}${location.search}`);
  };

  const openImage = (mediaItem) => {
    const index = imageMedia.findIndex((item) => item.id === mediaItem.id);
    setActiveImageIndex(index);
  };

  const closeViewer = () => setActiveImageIndex(null);

  const goToImage = useCallback((direction) => {
    setActiveImageIndex((currentIndex) => {
      if (currentIndex === null || imageMedia.length === 0) return currentIndex;
      return (currentIndex + direction + imageMedia.length) % imageMedia.length;
    });
  }, [imageMedia.length]);

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

  const handleQrScan = useCallback((value) => {
    try {
      const scannedUrl = new URL(value, window.location.origin);
      window.location.href = scannedUrl.toString();
    } catch {
      setError('QR code non reconnu. Veuillez rescanner le QR de votre badge.');
    }
  }, []);

  const downloadItems = useCallback((items) => {
    if (items.length === 0) return;

    items.forEach((item, index) => {
      window.setTimeout(() => {
        const link = document.createElement('a');
        link.href = isDemoMedia(item) ? item.publicUrl : getMediaUrl(item, accessCode, accessRole, 'download');
        link.download = item.originalName || `media-${index + 1}`;
        link.rel = 'noreferrer';
        document.body.appendChild(link);
        link.click();
        link.remove();
      }, index * 220);
    });
  }, [accessCode, accessRole]);

  const downloadAlbum = useCallback(async (nextAlbumSlug = selectedAlbumSlug) => {
    if (!nextAlbumSlug) return;

    let targetAlbum = nextAlbumSlug === albumData?.slug ? albumData : null;

    if (!targetAlbum) {
      try {
        targetAlbum = usingDemo
          ? demoAlbums[nextAlbumSlug]
          : (await fetchPublicAlbum(eventSlug, nextAlbumSlug, accessCode, accessRole)).album;
      } catch (downloadError) {
        setError(downloadError.message);
        return;
      }
    }

    downloadItems(targetAlbum?.media || []);
  }, [accessCode, accessRole, albumData, downloadItems, eventSlug, selectedAlbumSlug, usingDemo]);

  const toggleMediaSelection = (mediaId) => {
    setSelectedMediaIds((current) => (
      current.includes(mediaId)
        ? current.filter((id) => id !== mediaId)
        : [...current, mediaId]
    ));
  };

  const downloadSelectedMedia = () => {
    const selectedItems = media.filter((item) => selectedMediaIds.includes(item.id));
    downloadItems(selectedItems);
  };

  const showMyPhotos = () => {
    window.alert('La fonctionnalite Mes photos sera connectee ici.');
  };

  if (isLoadingEvent) {
    return (
      <main className="participant-shell center-state" data-theme={theme}>
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
      <AccessGate
        pendingCode={pendingCode}
        error={error}
        onChange={setPendingCode}
        onSubmit={submitAccessCode}
      />
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
    <main className="participant-shell" data-theme={theme}>
      <EventHero
        event={eventData}
        theme={theme}
        onThemeToggle={toggleTheme}
        onMyPhotos={showMyPhotos}
      />

      {usingDemo || error ? (
        <div className="notice page-notice">
          <span>{error || 'Apercu de demonstration'}</span>
        </div>
      ) : null}

      <AlbumRail
        albums={albums}
        selectedAlbumSlug={selectedAlbumSlug}
        accessCode={accessCode}
        accessRole={accessRole}
        onSelectAlbum={selectAlbum}
        onDownloadAlbum={downloadAlbum}
      />

      <GalleryView
        album={albumData}
        images={imageMedia}
        documents={documents}
        accessCode={accessCode}
        accessRole={accessRole}
        isLoading={isLoadingAlbum}
        selectedMediaIds={selectedMediaIds}
        onBackToAlbums={() => {
          setAlbumData(null);
          setActiveImageIndex(null);
          setSelectedMediaIds([]);
          navigate(`/events/${eventSlug}${location.search}`);
        }}
        onOpenImage={openImage}
        onToggleMediaSelection={toggleMediaSelection}
        onDownloadAlbum={() => downloadAlbum()}
        onDownloadSelected={downloadSelectedMedia}
      />

      <Lightbox
        activeImage={activeImage}
        activeImageIndex={activeImageIndex}
        imageCount={imageMedia.length}
        accessCode={accessCode}
        accessRole={accessRole}
        onClose={closeViewer}
        onGoToImage={goToImage}
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0].clientX;
        }}
        onTouchEnd={(event) => {
          if (touchStartX.current === null) return;
          const delta = event.changedTouches[0].clientX - touchStartX.current;
          if (Math.abs(delta) > 48) goToImage(delta > 0 ? -1 : 1);
          touchStartX.current = null;
        }}
      />
    </main>
  );
}

export default App;
