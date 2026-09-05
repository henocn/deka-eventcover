import { useMemo } from 'react';

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

// Affiche la courbe d'activite avec filtre de periode.
function ActivityChart({
  points = [],
  period = 'month',
  onPeriodChange,
}) {
  const width = 1000;
  const height = 320;
  const padding = { top: 28, right: 24, bottom: 40, left: 52 };
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
    <section className="w-full rounded-xl border-2 border-black bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black">Activite dans le temps</h3>
          <p className="mt-1 text-sm font-bold text-neutral-500">Courbe des vues et telechargements.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 text-xs font-black uppercase">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#9cff00]" />
              Vues
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-black" />
              Telechargements
            </span>
          </div>
          <select
            className="min-h-10 rounded border-2 border-black bg-white px-3 text-sm font-black outline-none"
            value={period}
            onChange={(event) => onPeriodChange?.(event.target.value)}
          >
            <option value="day">Jour</option>
            <option value="week">Semaine</option>
            <option value="month">Mois</option>
            <option value="all">Tout</option>
          </select>
        </div>
      </div>

      {!points.length ? (
        <div className="grid min-h-56 place-items-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-5 text-center text-sm font-extrabold text-neutral-500">
          Aucune donnee d'activite pour cette periode.
        </div>
      ) : (
        <div className="w-full">
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
                  <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#e5e5e5" strokeWidth="1" />
                  <text x={padding.left - 10} y={y + 4} textAnchor="end" className="fill-neutral-400 text-[11px] font-bold">
                    {formatAxisValue(tick)}
                  </text>
                </g>
              );
            })}

            <path d={buildPath('views')} fill="none" stroke="#9cff00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            <path d={buildPath('downloads')} fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />

            {points.map((point, index) => (
              <g key={`${point.date}-${index}`}>
                <circle cx={xFor(index)} cy={yFor(point.views || 0)} r="3.5" fill="#9cff00" stroke="#111" strokeWidth="1" vectorEffect="non-scaling-stroke">
                  <title>{`${point.date} · ${point.views || 0} vues`}</title>
                </circle>
                <circle cx={xFor(index)} cy={yFor(point.downloads || 0)} r="3.5" fill="#000" vectorEffect="non-scaling-stroke">
                  <title>{`${point.date} · ${point.downloads || 0} telechargements`}</title>
                </circle>
                {index % labelStep === 0 || index === points.length - 1 ? (
                  <text x={xFor(index)} y={height - 12} textAnchor="middle" className="fill-neutral-500 text-[10px] font-bold">
                    {formatLabel(point.date, period)}
                  </text>
                ) : null}
              </g>
            ))}
          </svg>
        </div>
      )}
    </section>
  );
}

export default ActivityChart;
