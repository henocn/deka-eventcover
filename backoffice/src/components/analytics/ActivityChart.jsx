// Affiche la courbe journaliere des vues et des telechargements.
function ActivityChart({ points = [] }) {
  const width = 720;
  const height = 280;
  const padding = { top: 24, right: 20, bottom: 36, left: 44 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  if (!points.length) {
    return (
      <section className="rounded-xl border-2 border-black bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-black">Activite dans le temps</h3>
          <p className="mt-1 text-sm font-bold text-neutral-500">Courbe des vues et telechargements.</p>
        </div>
        <div className="grid min-h-56 place-items-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-5 text-center text-sm font-extrabold text-neutral-500">
          Aucune donnee d'activite pour le moment.
        </div>
      </section>
    );
  }

  const maxValue = Math.max(...points.flatMap((point) => [point.views, point.downloads]), 1);

  function xFor(index) {
    if (points.length === 1) return padding.left + innerWidth / 2;
    return padding.left + (index / (points.length - 1)) * innerWidth;
  }

  function yFor(value) {
    return padding.top + innerHeight - (value / maxValue) * innerHeight;
  }

  function buildPath(key) {
    return points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${xFor(index)} ${yFor(point[key])}`)
      .join(' ');
  }

  const labelStep = Math.max(1, Math.ceil(points.length / 6));

  return (
    <section className="rounded-xl border-2 border-black bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black">Activite dans le temps</h3>
          <p className="mt-1 text-sm font-bold text-neutral-500">Courbe des vues et telechargements jour par jour.</p>
        </div>
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
      </div>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="min-w-full" role="img" aria-label="Courbe d'activite">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + innerHeight * (1 - ratio);
            const label = Math.round(maxValue * ratio);
            return (
              <g key={ratio}>
                <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#e5e5e5" strokeWidth="1" />
                <text x={padding.left - 8} y={y + 4} textAnchor="end" className="fill-neutral-400 text-[10px] font-bold">
                  {label}
                </text>
              </g>
            );
          })}

          <path d={buildPath('views')} fill="none" stroke="#9cff00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d={buildPath('downloads')} fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {points.map((point, index) => (
            <g key={point.date}>
              <circle cx={xFor(index)} cy={yFor(point.views)} r="3.5" fill="#9cff00" stroke="#111" strokeWidth="1" />
              <circle cx={xFor(index)} cy={yFor(point.downloads)} r="3.5" fill="#000" />
              {index % labelStep === 0 || index === points.length - 1 ? (
                <text x={xFor(index)} y={height - 10} textAnchor="middle" className="fill-neutral-500 text-[10px] font-bold">
                  {point.date.slice(5)}
                </text>
              ) : null}
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
}

export default ActivityChart;
