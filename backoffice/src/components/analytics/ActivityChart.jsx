import { useMemo } from 'react';

const PERIODS = [
  { value: 'day', label: 'Jour' },
  { value: 'week', label: 'Semaine' },
  { value: 'month', label: 'Mois' },
  { value: 'all', label: 'Tout' },
];

function formatAxisValue(value) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(Math.round(value));
}

function formatLabel(dateKey, period) {
  if (period === 'day') {
    return dateKey.slice(11, 16) || dateKey.slice(-5);
  }
  if (dateKey.includes('-W')) {
    return dateKey.replace('-', ' ');
  }
  return dateKey.slice(5);
}

function niceMax(value) {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  if (normalized <= 1) return magnitude;
  if (normalized <= 2) return 2 * magnitude;
  if (normalized <= 5) return 5 * magnitude;
  return 10 * magnitude;
}

// Courbe d'activite pleine largeur avec filtre de periode.
function ActivityChart({ points = [], period = 'day', onPeriodChange }) {
  const width = 1000;
  const height = 300;
  const padding = { top: 20, right: 16, bottom: 36, left: 44 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const maxValue = useMemo(
    () => niceMax(Math.max(...points.flatMap((point) => [point.views || 0, point.downloads || 0]), 1)),
    [points],
  );

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => Math.round(maxValue * ratio));
  const labelStep = Math.max(1, Math.ceil(Math.max(points.length, 1) / 8));

  function xFor(index) {
    if (points.length <= 1) return padding.left + innerWidth / 2;
    return padding.left + (index / (points.length - 1)) * innerWidth;
  }

  function yFor(value) {
    return padding.top + innerHeight - (value / maxValue) * innerHeight;
  }

  function buildPath(key) {
    if (!points.length) return '';
    return points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${xFor(index)} ${yFor(point[key] || 0)}`)
      .join(' ');
  }

  return (
    <section className="w-full rounded-lg border border-black bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/20 px-5 py-4">
        <div>
          <h3 className="text-base font-semibold text-neutral-950">Activite</h3>
          <p className="mt-0.5 text-sm text-neutral-500">Vues et telechargements dans le temps</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 text-xs font-medium text-neutral-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#7ab800]" />
              Vues
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-neutral-900" />
              Telech.
            </span>
          </div>
          <div className="inline-flex rounded-md border border-neutral-200 bg-neutral-50 p-0.5">
            {PERIODS.map((item) => (
              <button
                key={item.value}
                type="button"
                className={`min-h-8 rounded px-2.5 text-xs font-semibold transition ${
                  period === item.value
                    ? 'bg-white text-neutral-950 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
                onClick={() => onPeriodChange?.(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-3 py-3">
        {!points.length ? (
          <div className="grid min-h-52 place-items-center text-sm font-medium text-neutral-500">
            Aucune donnee pour cette periode.
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-auto w-full"
            role="img"
            aria-label="Courbe d'activite"
            preserveAspectRatio="xMidYMid meet"
          >
            {yTicks.map((tick) => {
              const y = yFor(tick);
              return (
                <g key={tick}>
                  <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#f0f0f0" strokeWidth="1" />
                  <text x={padding.left - 8} y={y + 4} textAnchor="end" className="fill-neutral-400 text-[10px] font-medium">
                    {formatAxisValue(tick)}
                  </text>
                </g>
              );
            })}

            <path d={buildPath('views')} fill="none" stroke="#7ab800" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            <path d={buildPath('downloads')} fill="none" stroke="#171717" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />

            {points.map((point, index) => (
              <g key={`${point.date}-${index}`}>
                <circle cx={xFor(index)} cy={yFor(point.views || 0)} r="2.75" fill="#7ab800" vectorEffect="non-scaling-stroke">
                  <title>{`${point.date} · ${point.views || 0} vues`}</title>
                </circle>
                <circle cx={xFor(index)} cy={yFor(point.downloads || 0)} r="2.75" fill="#171717" vectorEffect="non-scaling-stroke">
                  <title>{`${point.date} · ${point.downloads || 0} telechargements`}</title>
                </circle>
                {index % labelStep === 0 || index === points.length - 1 ? (
                  <text x={xFor(index)} y={height - 10} textAnchor="middle" className="fill-neutral-400 text-[10px] font-medium">
                    {formatLabel(point.date, period)}
                  </text>
                ) : null}
              </g>
            ))}
          </svg>
        )}
      </div>
    </section>
  );
}

export default ActivityChart;
