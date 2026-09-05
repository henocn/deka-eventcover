import {
  ArrowDownToLine,
  Eye,
  FolderOpen,
  Image,
  Loader2,
  RefreshCw,
  ScanFace,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { fetchAnalytics } from '../api';
import ActivityChart from '../components/analytics/ActivityChart';
import MetricCard from '../components/analytics/MetricCard';
import TopAlbumsTable from '../components/analytics/TopAlbumsTable';
import { Button, Field, StatusPill } from '../components/ui';
import useEvents from '../hooks/useEvents';
import { inputClass } from '../utils/styleClasses';

function formatNumber(value) {
  return new Intl.NumberFormat('fr-FR').format(value || 0);
}

// Formate les grands totaux : 1234 -> 1,234k ; 3111001 -> 3,112M (3 decimales max).
function formatCompactCount(value) {
  const amount = Number(value) || 0;

  if (amount < 1000) {
    return formatNumber(amount);
  }

  const unit = amount >= 1_000_000 ? 'M' : 'k';
  const divisor = amount >= 1_000_000 ? 1_000_000 : 1000;
  const scaled = amount / divisor;
  const rounded = Math.round(scaled * 1000) / 1000;
  const [integerPart, decimalPart = ''] = String(rounded).split('.');
  const decimals = decimalPart.padEnd(3, '0').slice(0, 3);

  return `${formatNumber(Number(integerPart))},${decimals}${unit}`;
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

  return (
    <section className="min-w-0 px-6 pb-8 pt-6 max-[760px]:p-4">
      <div className="mb-6 flex items-end justify-between gap-4 max-[860px]:flex-col max-[860px]:items-stretch">
        <h2 className="text-[24px] font-black">Vue analytique</h2>
        <div className="flex items-end gap-3 max-[760px]:flex-col max-[760px]:items-stretch">
          <Field className="w-[min(360px,55vw)] max-[760px]:w-full">
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
            <MetricCard icon={<ScanFace size={18} />}>
              <div className="grid gap-3">
                <div>
                  <strong className="block text-3xl font-black tracking-normal">{formatNumber(totals.facesCount)}</strong>
                  <p className="mt-1 text-sm font-bold text-neutral-500">Visages detectes</p>
                </div>
                <div className="border-t border-neutral-200 pt-3">
                  <strong className="block text-2xl font-black tracking-normal">{formatNumber(totals.peopleEstimate)}</strong>
                  <p className="mt-1 text-sm font-bold text-neutral-500">Personnes estimees</p>
                </div>
              </div>
            </MetricCard>
            <MetricCard icon={<FolderOpen size={18} />}>
              <div className="grid gap-3">
                <div>
                  <strong className="block text-3xl font-black tracking-normal">{formatNumber(totals.albumsCount)}</strong>
                  <p className="mt-1 text-sm font-bold text-neutral-500">Albums</p>
                </div>
                <div className="border-t border-neutral-200 pt-3">
                  <strong className="block text-2xl font-black tracking-normal">{formatNumber(totals.activeAlbumsCount)}</strong>
                  <p className="mt-1 text-sm font-bold text-neutral-500">Albums actifs</p>
                </div>
              </div>
            </MetricCard>
            <MetricCard icon={<Image size={18} />} value={formatNumber(totals.mediaCount)} label="Photos" />
            <MetricCard tone="engagement" icon={<Eye size={18} />}>
              <div className="grid gap-3">
                <div>
                  <strong className="block text-3xl font-black tracking-normal text-[#9cff00]">{formatCompactCount(totals.viewsCount)}</strong>
                  <p className="mt-1 text-sm font-bold text-white/70">Vues</p>
                </div>
                <div className="border-t border-white/15 pt-3">
                  <div className="flex items-center gap-2">
                    <ArrowDownToLine size={16} className="text-[#9cff00]" />
                    <strong className="text-2xl font-black tracking-normal">{formatCompactCount(totals.downloadsCount)}</strong>
                  </div>
                  <p className="mt-1 text-sm font-bold text-white/70">Telechargements</p>
                </div>
              </div>
            </MetricCard>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)] gap-5 max-[1080px]:grid-cols-1">
            <ActivityChart points={analytics.activityTimeline || []} />
            <TopAlbumsTable albums={analytics.topAlbums} />
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default AnalyticsPage;
