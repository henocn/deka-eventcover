// Petite card de ratio : grand chiffre + libelle discret en dessous.
function RatioStatCard({ value, label, title }) {
  return (
    <article className="min-w-0 rounded-lg border border-black bg-white px-3.5 py-3" title={title}>
      <strong className="block text-[1.35rem] font-semibold tracking-tight text-neutral-950">{value}</strong>
      <p className="mt-1 text-xs font-medium leading-snug text-neutral-500">{label}</p>
    </article>
  );
}

export default RatioStatCard;
