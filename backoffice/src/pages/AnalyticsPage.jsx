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

function formatCompactCount(value) {
  const amount = Number(value) || 0;

  if (amount < 1000) {
    return formatNumber(amount);
  }

  const unit = amount >= 1_000_000 ? 'M' : 'k';
  const divisor = amount >= 1_000_000 ? 1_000_000 : 1000;
  const scaled = amount / divisor;
  const rounded = Math.round(scaled * 100) / 100;
  return `${String(rounded).replace('.', ',')}${unit}`;
}

function AnalyticsPage() {
  const { events } = useEvents();
  const [selectedEventId, setSelectedEventId] = useState('');
  const [period, setPeriod] = useState('day');
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === Number(selectedEventId)) || null,
    [events, selectedEventId],
  );

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      setAnalytics(await fetchAnalytics(selectedEventId || null, period));
    } catch (analyticsError) {
      toast.error(analyticsError.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedEventId, period]);

  useEffect(() => {
    queueMicrotask(() => loadAnalytics());
  }, [loadAnalytics]);

  const totals = analytics?.totals || {};

  return (
    <section className="min-w-0 px-6 pb-8 pt-6 max-[760px]:p-4">
      <div className="mb-6 flex items-end justify-between gap-4 max-[860px]:flex-col max-[860px]:items-stretch">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-neutral-950">Analytics</h2>
          <p className="mt-1 text-sm text-neutral-500">Vue d'ensemble de l'activite participant</p>
        </div>
        <div className="flex items-end gap-2.5 max-[760px]:flex-col max-[760px]:items-stretch">
          <Field className="w-[min(320px,55vw)] max-[760px]:w-full">
            <select className={`${inputClass} min-h-[38px]`} value={selectedEventId} onChange={(event) => setSelectedEventId(event.target.value)}>
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
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-black bg-white px-4 py-3">
          <div>
            <span className="text-xs font-medium text-neutral-500">Evenement</span>
            <h3 className="mt-0.5 text-sm font-semibold text-neutral-950">{selectedEvent.title}</h3>
          </div>
          <StatusPill status={selectedEvent.isPublished ? 'published' : 'draft'}>
            {selectedEvent.isPublished ? 'Publie' : 'Brouillon'}
          </StatusPill>
        </div>
      ) : null}

      {isLoading && !analytics ? (
        <div className="grid min-h-[360px] place-items-center rounded-lg border border-black bg-white text-neutral-500">
          <span className="inline-flex items-center gap-2 text-sm font-medium">
            <Loader2 className="animate-spin" size={16} />
            Chargement...
          </span>
        </div>
      ) : null}

      {analytics ? (
        <div className="grid gap-4">
          <div className="grid grid-cols-4 gap-3 max-[1180px]:grid-cols-2 max-[640px]:grid-cols-1">
            <MetricCard
              icon={<ScanFace size={15} />}
              label="Visages detectes"
              value={<span title={formatNumber(totals.facesCount)}>{formatCompactCount(totals.facesCount)}</span>}
            />
            <MetricCard
              icon={<Image size={15} />}
              label="Photos"
              value={<span title={formatNumber(totals.mediaCount)}>{formatCompactCount(totals.mediaCount)}</span>}
            />
            <MetricCard icon={<FolderOpen size={15} />} label="Albums actifs">
              <strong className="block text-[1.75rem] font-semibold tracking-tight text-neutral-950" title={`${formatNumber(totals.activeAlbumsCount)} / ${formatNumber(totals.albumsCount)}`}>
                {formatNumber(totals.activeAlbumsCount)}/{formatNumber(totals.albumsCount)}
              </strong>
            </MetricCard>
            <MetricCard tone="engagement" icon={<Eye size={15} />} label="Engagement">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <strong className="block text-[1.35rem] font-semibold tracking-tight text-neutral-950" title={formatNumber(totals.viewsCount)}>
                    {formatCompactCount(totals.viewsCount)}
                  </strong>
                  <p className="mt-0.5 text-xs text-neutral-500">Vues</p>
                </div>
                <div className="border-l border-neutral-100 pl-3">
                  <div className="flex items-center gap-1.5">
                    <ArrowDownToLine size={14} className="text-neutral-400" />
                    <strong className="text-[1.35rem] font-semibold tracking-tight text-neutral-950" title={formatNumber(totals.downloadsCount)}>
                      {formatCompactCount(totals.downloadsCount)}
                    </strong>
                  </div>
                  <p className="mt-0.5 text-xs text-neutral-500">Téléch.</p>
                </div>
              </div>
            </MetricCard>
          </div>

          <TopAlbumsTable albums={analytics.topAlbums} />
          <ActivityChart
            points={analytics.activityTimeline || []}
            period={period}
            onPeriodChange={setPeriod}
          />
        </div>
      ) : null}
    </section>
  );
}

export default AnalyticsPage;
