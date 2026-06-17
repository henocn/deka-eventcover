import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  API_URL,
  fetchPublicAlbum,
  fetchPublicEvent,
  getMediaUrl,
  resolveBadgeCode,
  searchMyPhotosByEmbedding,
  validateEventAccess,
} from '../api';
import AccessGate from '../components/AccessGate';
import AlbumRail from '../components/AlbumRail';
import EventHero from '../components/EventHero';
import GalleryView from '../components/GalleryView';
import Lightbox from '../components/Lightbox';
import MyPhotosModal from '../components/MyPhotosModal';
import QrScannerPanel from '../components/QrScannerPanel';
import { demoAlbums, demoEvent } from '../demoData';
import {
  clearMyPhotosEmbeddingCookie,
  getAccessCodeCookie,
  getMyPhotosEmbeddingCookie,
  saveAccessCodeCookie,
} from '../utils/participantCookies';
import {
  getInitialRole,
  isDemoMedia,
  normalizeAlbums,
} from '../utils/participantUtils';

function ParticipantEventPage() {
  const { albumSlug, eventSlug: routeEventSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const eventSlug = routeEventSlug || '';
  const [accessRole] = useState(getInitialRole);
  const [theme, setTheme] = useState(() => window.localStorage.getItem('deka.participant.theme') || 'light');
  const [eventData, setEventData] = useState(null);
  const [albumData, setAlbumData] = useState(null);
  const [accessCode, setAccessCode] = useState(() => (
    new URLSearchParams(window.location.search).get('accessCode') || getAccessCodeCookie(eventSlug) || ''
  ));
  const [pendingCode, setPendingCode] = useState(() => (
    new URLSearchParams(window.location.search).get('accessCode') || getAccessCodeCookie(eventSlug) || ''
  ));
  const [requiresAccessCode, setRequiresAccessCode] = useState(false);
  const [invalidBadge, setInvalidBadge] = useState(false);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  const [isLoadingAlbum, setIsLoadingAlbum] = useState(false);
  const [isLoadingMyPhotos, setIsLoadingMyPhotos] = useState(false);
  const [error, setError] = useState('');
  const [usingDemo, setUsingDemo] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(null);
  const [selectedMediaIds, setSelectedMediaIds] = useState([]);
  const [isMyPhotosOpen, setIsMyPhotosOpen] = useState(false);
  const [myPhotosResult, setMyPhotosResult] = useState(null);
  const touchStartX = useRef(null);

  const isMyPhotosRoute = Boolean(eventSlug && location.pathname === `/events/${eventSlug}/my-photos`);
  const selectedAlbumSlug = albumSlug || null;
  const albums = useMemo(() => normalizeAlbums(eventData?.albums), [eventData]);
  const media = albumData?.media || [];
  const imageMedia = media.filter((item) => item.type === 'image');
  const myPhotosMedia = useMemo(
    () => (myPhotosResult?.matches || []).map((match) => match.media).filter((item) => item?.type === 'image'),
    [myPhotosResult],
  );
  const activeImages = isMyPhotosRoute ? myPhotosMedia : imageMedia;
  const documents = media.filter((item) => item.type !== 'image');
  const activeImage = activeImageIndex !== null ? activeImages[activeImageIndex] : null;

  function myPhotosStorageKey() {
    return `deka.myPhotos.${eventSlug}.${accessRole || 'classic'}`;
  }

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
        if (nextAccessCode) saveAccessCodeCookie(eventSlug, nextAccessCode);
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
    async (nextAlbumSlug, nextAccessCode = accessCode) => {
      if (!nextAlbumSlug) return;

      setIsLoadingAlbum(true);
      setError('');

      try {
        if (usingDemo) {
          setAlbumData(demoAlbums[nextAlbumSlug] || demoAlbums[demoEvent.albums[0].slug]);
          return;
        }

        const result = await fetchPublicAlbum(eventSlug, nextAlbumSlug, nextAccessCode, accessRole);
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
    queueMicrotask(() => loadEvent());
  }, [loadEvent]);

  useEffect(() => {
    if (isMyPhotosRoute) {
      queueMicrotask(() => {
        setAlbumData(null);
        setActiveImageIndex(null);
        setSelectedMediaIds([]);
      });
      return;
    }

    if (!selectedAlbumSlug) {
      queueMicrotask(() => {
        setAlbumData(null);
        setActiveImageIndex(null);
        setSelectedMediaIds([]);
      });
      return;
    }

    queueMicrotask(() => loadAlbum(selectedAlbumSlug));
  }, [isMyPhotosRoute, loadAlbum, selectedAlbumSlug]);

  useEffect(() => {
    if (!isMyPhotosRoute || !eventSlug || isLoadingEvent) return;

    async function loadMyPhotos() {
      setIsLoadingMyPhotos(true);
      setError('');
      setActiveImageIndex(null);
      setSelectedMediaIds([]);

      const cachedResult = window.sessionStorage.getItem(myPhotosStorageKey());
      if (cachedResult) {
        try {
          setMyPhotosResult(JSON.parse(cachedResult));
          setIsLoadingMyPhotos(false);
          return;
        } catch {
          window.sessionStorage.removeItem(myPhotosStorageKey());
        }
      }

      const embedding = getMyPhotosEmbeddingCookie(eventSlug, accessRole);
      if (!embedding) {
        setMyPhotosResult(null);
        setIsMyPhotosOpen(true);
        setIsLoadingMyPhotos(false);
        return;
      }

      try {
        const result = await searchMyPhotosByEmbedding(eventSlug, embedding, accessCode, accessRole);
        setMyPhotosResult(result);
        window.sessionStorage.setItem(myPhotosStorageKey(), JSON.stringify(result));
      } catch (myPhotosError) {
        clearMyPhotosEmbeddingCookie(eventSlug, accessRole);
        setMyPhotosResult(null);
        setIsMyPhotosOpen(true);
        setError(myPhotosError.message);
      } finally {
        setIsLoadingMyPhotos(false);
      }
    }

    queueMicrotask(() => loadMyPhotos());
  }, [accessCode, accessRole, eventSlug, isLoadingEvent, isMyPhotosRoute]);

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

  async function submitAccessCode(event) {
    event.preventDefault();
    setError('');

    try {
      await validateEventAccess(eventSlug, pendingCode);
      saveAccessCodeCookie(eventSlug, pendingCode);
      setAccessCode(pendingCode);
      setRequiresAccessCode(false);
      await loadEvent(pendingCode);
    } catch (accessError) {
      setError(accessError.message || 'Code invalide');
    }
  }

  function selectAlbum(nextAlbumSlug) {
    setAlbumData(null);
    setActiveImageIndex(null);
    setSelectedMediaIds([]);
    navigate(`/events/${eventSlug}/albums/${nextAlbumSlug}${location.search}`);
  }

  function openImage(mediaItem) {
    const index = activeImages.findIndex((item) => item.id === mediaItem.id);
    setActiveImageIndex(index);
  }

  const goToImage = useCallback((direction) => {
    setActiveImageIndex((currentIndex) => {
      if (currentIndex === null || activeImages.length === 0) return currentIndex;
      return (currentIndex + direction + activeImages.length) % activeImages.length;
    });
  }, [activeImages.length]);

  useEffect(() => {
    function onKeyDown(event) {
      if (activeImageIndex === null) return;
      if (event.key === 'Escape') setActiveImageIndex(null);
      if (event.key === 'ArrowLeft') goToImage(-1);
      if (event.key === 'ArrowRight') goToImage(1);
    }

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

  const handleManualBadgeCode = useCallback(async (badgeCode) => {
    try {
      const badge = await resolveBadgeCode(badgeCode);
      window.location.href = badge.publicUrl;
    } catch (badgeError) {
      setError(badgeError.message || 'Badge non reconnu');
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

  function toggleMediaSelection(mediaId) {
    setSelectedMediaIds((current) => (
      current.includes(mediaId)
        ? current.filter((id) => id !== mediaId)
        : [...current, mediaId]
    ));
  }

  function backToAlbums() {
    setAlbumData(null);
    setActiveImageIndex(null);
    setSelectedMediaIds([]);
    navigate(`/events/${eventSlug}${location.search}`);
  }

  function openMyPhotos() {
    const embedding = getMyPhotosEmbeddingCookie(eventSlug, accessRole);
    if (embedding) {
      navigate(`/events/${eventSlug}/my-photos${location.search}`);
      return;
    }

    setIsMyPhotosOpen(true);
  }

  function handleMyPhotosSearchComplete(result) {
    setMyPhotosResult(result);
    window.sessionStorage.setItem(myPhotosStorageKey(), JSON.stringify(result));
    setIsMyPhotosOpen(false);
    navigate(`/events/${eventSlug}/my-photos${location.search}`);
  }

  if (isLoadingEvent) {
    return (
      <main className="participant-shell grid min-h-svh place-items-center gap-3 p-5 text-[var(--muted)] text-white" data-theme={theme}>
        <Loader2 className="animate-spin" size={28} />
        <p className="font-bold">Chargement de l'evenement</p>
      </main>
    );
  }

  if (!eventSlug) {
    return (
      <QrScannerPanel
        title="Votre mode d'accès"
        description="Utilisez le code manuel ou scannez le QR code de votre badge."
        error={error}
        onManualCode={handleManualBadgeCode}
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
        description="Le QR code ne correspond pas a un badge actif. Veuillez scanner un badge actif."
        error={error}
        onManualCode={handleManualBadgeCode}
        onScan={handleQrScan}
      />
    );
  }

  return (
    <main className="participant-shell min-h-svh px-5 py-5 text-[var(--text)] max-[680px]:px-3" data-theme={theme}>
      <EventHero
        event={eventData}
        theme={theme}
        onThemeToggle={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
        onMyPhotos={openMyPhotos}
      />

      {usingDemo || error ? (
        <div className="mx-auto mb-5 w-[min(1180px,100%)] rounded-xl border border-red-300 bg-red-50 px-4 py-3 font-bold text-red-700">
          <span>{error || 'Apercu de demonstration'}</span>
        </div>
      ) : null}

      {isMyPhotosRoute ? (
        <GalleryView
          album={{
            id: 'my-photos',
            title: 'Mes photos',
            description: myPhotosResult?.matches?.length
              ? `${myPhotosResult.matches.length} photo${myPhotosResult.matches.length > 1 ? 's' : ''} retrouvee${myPhotosResult.matches.length > 1 ? 's' : ''}.`
              : '',
          }}
          images={myPhotosMedia}
          documents={[]}
          accessCode={accessCode}
          accessRole={accessRole}
          isLoading={isLoadingMyPhotos}
          selectedMediaIds={selectedMediaIds}
          onBackToAlbums={backToAlbums}
          onOpenImage={openImage}
          onToggleMediaSelection={toggleMediaSelection}
          onDownloadAlbum={() => downloadItems(myPhotosMedia)}
          onDownloadSelected={() => downloadItems(myPhotosMedia.filter((item) => selectedMediaIds.includes(item.id)))}
        />
      ) : selectedAlbumSlug ? (
        <GalleryView
          album={albumData}
          images={imageMedia}
          documents={documents}
          accessCode={accessCode}
          accessRole={accessRole}
          isLoading={isLoadingAlbum}
          selectedMediaIds={selectedMediaIds}
          onBackToAlbums={backToAlbums}
          onOpenImage={openImage}
          onToggleMediaSelection={toggleMediaSelection}
          onDownloadAlbum={() => downloadAlbum()}
          onDownloadSelected={() => downloadItems(media.filter((item) => selectedMediaIds.includes(item.id)))}
        />
      ) : (
        <AlbumRail
          albums={albums}
          selectedAlbumSlug={selectedAlbumSlug}
          accessCode={accessCode}
          accessRole={accessRole}
          onSelectAlbum={selectAlbum}
          onDownloadAlbum={downloadAlbum}
        />
      )}

      <Lightbox
        activeImage={activeImage}
        activeImageIndex={activeImageIndex}
        imageCount={activeImages.length}
        accessCode={accessCode}
        accessRole={accessRole}
        onClose={() => setActiveImageIndex(null)}
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

      {isMyPhotosOpen ? (
        <MyPhotosModal
          accessCode={accessCode}
          accessRole={accessRole}
          eventSlug={eventSlug}
          onSearchComplete={handleMyPhotosSearchComplete}
          onClose={() => setIsMyPhotosOpen(false)}
        />
      ) : null}
    </main>
  );
}

export default ParticipantEventPage;
