import {
  ArrowDownToLine,
  BarChart3,
  CalendarDays,
  Eye,
  FolderOpen,
  Image,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { fetchAnalytics } from '../api';
import DailyActivityChart from '../components/analytics/DailyActivityChart';
import MetricCard from '../components/analytics/MetricCard';
import RecentUploads from '../components/analytics/RecentUploads';
import TopAlbumsTable from '../components/analytics/TopAlbumsTable';
import { Button, Field, StatusPill } from '../components/ui';
import useEvents from '../hooks/useEvents';
import { inputClass } from '../utils/styleClasses';

function formatNumber(value) {
  return new Intl.NumberFormat('fr-FR').format(value || 0);
}

function AnalyticsPage() {
  const { events } = useEvents();
  const [selectedEventId, setSelectedEventId] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === Number(selectedEventId)) || null,
    [events, selectedEventId],
  );

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      setAnalytics(await fetchAnalytics(selectedEventId || null));
    } catch (analyticsError) {
      toast.error(analyticsError.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedEventId]);

  useEffect(() => {
    queueMicrotask(() => loadAnalytics());
  }, [loadAnalytics]);

  const totals = analytics?.totals || {};
  const eventSummaries = analytics?.eventSummaries || [];
  const maxEventMedia = Math.max(...eventSummaries.map((event) => event.mediaCount), 1);

  return (
    <section className="min-w-0 px-6 pb-8 pt-6 max-[760px]:p-4">
      <div className="mb-6 flex items-end justify-between gap-4 max-[860px]:flex-col max-[860px]:items-stretch">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-black px-3 py-1 text-xs font-black uppercase text-[#9cff00]">
            <BarChart3 size={14} />
            Analytics
          </p>
          <h2 className="text-[24px] font-black">Vue analytique</h2>
          <p className="mt-1 max-w-2xl text-sm font-bold text-neutral-500">
            Suivez l'activite des evenements, albums, medias et interactions participants.
          </p>
        </div>

        <div className="flex items-end gap-3 max-[760px]:flex-col max-[760px]:items-stretch">
          <Field label="Portee" className="w-[min(360px,55vw)] max-[760px]:w-full">
            <select className={`${inputClass} min-h-[40px]`} value={selectedEventId} onChange={(event) => setSelectedEventId(event.target.value)}>
              <option value="">Tout le compte</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>{event.title}</option>
              ))}
            </select>
          </Field>
          <Button tone="soft" onClick={loadAnalytics} disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
            Actualiser
          </Button>
        </div>
      </div>

      {selectedEvent ? (
        <div className="mb-5 rounded-xl border border-neutral-300 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-black uppercase text-neutral-500">Evenement selectionne</span>
              <h3 className="mt-1 text-lg font-black">{selectedEvent.title}</h3>
            </div>
            <StatusPill status={selectedEvent.isPublished ? 'published' : 'draft'}>
              {selectedEvent.isPublished ? 'Publie' : 'Brouillon'}
            </StatusPill>
          </div>
        </div>
      ) : null}

      {isLoading && !analytics ? (
        <div className="grid min-h-[420px] place-items-center rounded-xl border border-neutral-300 bg-white p-8 text-neutral-500">
          <span className="inline-flex items-center gap-2 font-black">
            <Loader2 className="animate-spin" size={18} />
            Chargement des analytics...
          </span>
        </div>
      ) : null}

      {analytics ? (
        <div className="grid gap-5">
          <div className="grid grid-cols-4 gap-4 max-[1180px]:grid-cols-2 max-[640px]:grid-cols-1">
            <MetricCard tone="dark" icon={<CalendarDays size={18} />} value={formatNumber(totals.eventsCount)} label="Evenements suivis" />
            <MetricCard tone="accent" icon={<FolderOpen size={18} />} value={formatNumber(totals.albumsCount)} label="Albums photos" />
            <MetricCard icon={<Image size={18} />} value={formatNumber(totals.mediaCount)} label="Medias uploades" />
            <MetricCard icon={<ShieldCheck size={18} />} value={formatNumber(totals.badgesCount)} label="Badges d'acces" />
            <MetricCard icon={<Eye size={18} />} value={formatNumber(totals.viewsCount)} label="Vues photos" />
            <MetricCard icon={<ArrowDownToLine size={18} />} value={formatNumber(totals.downloadsCount)} label="Telechargements" />
            <MetricCard icon={<BarChart3 size={18} />} value={formatNumber(totals.interactionsCount)} label="Interactions" />
            <MetricCard icon={<FolderOpen size={18} />} value={formatNumber(totals.activeAlbumsCount)} label="Albums actifs" />
          </div>

          <div className="grid grid-cols-[minmax(0,1.45fr)_minmax(340px,0.8fr)] gap-5 max-[1080px]:grid-cols-1">
            <DailyActivityChart series={analytics.dailySeries} />
            <TopAlbumsTable albums={analytics.topAlbums} />
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)] gap-5 max-[1080px]:grid-cols-1">
            <section className="rounded-xl border border-neutral-300 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg font-black">Repartition par evenement</h3>
                <p className="mt-1 text-sm font-bold text-neutral-500">Volume de medias et structure des collections.</p>
              </div>
              <div className="grid gap-3">
                {eventSummaries.length === 0 ? (
                  <div className="grid min-h-40 place-items-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-5 text-center text-sm font-extrabold text-neutral-500">
                    Aucun evenement disponible.
                  </div>
                ) : null}
                {eventSummaries.map((event) => (
                  <article key={event.id} className="rounded-lg border border-neutral-300 bg-white p-3">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <strong className="min-w-0 truncate font-black">{event.title}</strong>
                      <span className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-black text-neutral-600">
                        {event.albumsCount} albums
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                      <div className="h-full rounded-full bg-black" style={{ width: `${Math.max((event.mediaCount / maxEventMedia) * 100, event.mediaCount ? 8 : 0)}%` }} />
                    </div>
                    <div className="mt-2 flex justify-between text-xs font-black text-neutral-500">
                      <span>{event.mediaCount} medias</span>
                      <span>{event.badgesCount} badges</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <RecentUploads uploads={analytics.recentUploads} />
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default AnalyticsPage;
