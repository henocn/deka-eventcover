function MetricCard({ icon, label, tone = 'light', value }) {
  const tones = {
    dark: 'border-black bg-black text-white',
    accent: 'border-[#9cff00] bg-[#9cff00] text-black',
    light: 'border-neutral-300 bg-white text-neutral-950',
  };

  return (
    <article className={`min-w-0 rounded-xl border p-4 shadow-sm ${tones[tone]}`}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <span className={`grid h-9 w-9 place-items-center rounded-full ${tone === 'dark' ? 'bg-white text-black' : 'bg-black text-white'}`}>
          {icon}
        </span>
        <span className="rounded-full border border-current/20 px-2.5 py-1 text-[11px] font-black uppercase opacity-75">
          KPI
        </span>
      </div>
      <strong className="block text-3xl font-black tracking-normal">{value}</strong>
      <p className={`mt-1 text-sm font-bold ${tone === 'light' ? 'text-neutral-500' : 'text-current/75'}`}>{label}</p>
    </article>
  );
}

export default MetricCard;
