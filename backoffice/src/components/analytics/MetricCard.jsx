// Carte metrique sobre (style admin / shadcn) — label discret, chiffre fort.
function MetricCard({ icon, label, tone = 'light', value, children }) {
  const isEngagement = tone === 'engagement';

  return (
    <article
      className={`min-w-0 rounded-lg border border-black bg-white p-4 ${
        isEngagement ? 'shadow-sm' : ''
      }`}
    >
      <div className="mb-3 flex items-center gap-2 text-neutral-500">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-neutral-100 text-neutral-700">
          {icon}
        </span>
        <span className="text-xs font-semibold tracking-wide text-neutral-500">{label || 'Activite'}</span>
      </div>
      {children || (
        <strong className="block text-[1.75rem] font-semibold tracking-tight text-neutral-950">{value}</strong>
      )}
    </article>
  );
}

export default MetricCard;
