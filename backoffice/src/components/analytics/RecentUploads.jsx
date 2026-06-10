import { FileImage, HardDrive } from 'lucide-react';

function formatSize(sizeBytes) {
  if (!sizeBytes) return '0 Ko';
  const megabytes = sizeBytes / (1024 * 1024);
  if (megabytes >= 1) return `${megabytes.toFixed(1)} Mo`;
  return `${Math.max(sizeBytes / 1024, 1).toFixed(0)} Ko`;
}

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function RecentUploads({ uploads = [] }) {
  return (
    <section className="rounded-xl border border-neutral-300 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black">Derniers fichiers</h3>
          <p className="mt-1 text-sm font-bold text-neutral-500">Les medias ajoutes recemment.</p>
        </div>
        <HardDrive size={20} />
      </div>

      <div className="grid gap-2.5">
        {uploads.length === 0 ? (
          <div className="grid min-h-40 place-items-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-5 text-center text-sm font-extrabold text-neutral-500">
            Aucun fichier ajoute.
          </div>
        ) : null}
        {uploads.map((upload) => (
          <article key={upload.id} className="grid min-w-0 grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-neutral-300 bg-white p-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-neutral-100 text-black">
              <FileImage size={18} />
            </span>
            <div className="min-w-0">
              <strong className="block truncate text-sm font-black">{upload.originalName}</strong>
              <span className="mt-0.5 block truncate text-xs font-bold text-neutral-500">{upload.album?.title} - {upload.event?.title}</span>
            </div>
            <div className="text-right text-xs font-black text-neutral-500">
              <span className="block text-neutral-950">{formatSize(upload.sizeBytes)}</span>
              <span>{formatDate(upload.createdAt)}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default RecentUploads;
