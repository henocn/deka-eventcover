function MetricCard({ icon, label, tone = 'light', value, children }) {
  const tones = {
    light: 'border-black border-2 bg-white text-neutral-950',
    engagement: 'border-[#9cff00] border-2 bg-[linear-gradient(160deg,#0a0a0a_0%,#1a1a1a_55%,#111811_100%)] text-white',
  };

  const isEngagement = tone === 'engagement';

  return (
    <article className={`min-w-0 rounded-xl border p-4 shadow-sm ${tones[tone] || tones.light}`}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <span className={`grid h-9 w-9 place-items-center rounded-full ${isEngagement ? 'bg-white text-black' : 'bg-black text-white'}`}>
          {icon}
        </span>
        <span className="rounded-full border border-current/70 px-2.5 py-1 text-[11px] font-black uppercase opacity-75">
          KPI
        </span>
      </div>
      {children || (
        <>
          <strong className="block text-3xl font-black tracking-normal">{value}</strong>
          <p className={`mt-1 text-sm font-bold ${isEngagement ? 'text-white/70' : 'text-neutral-500'}`}>{label}</p>
        </>
      )}
    </article>
  );
}

export default MetricCard;
