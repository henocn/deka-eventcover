import { ArrowDownToLine, Eye, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function formatNumber(value) {
  return new Intl.NumberFormat('fr-FR').format(value || 0);
}

// Formate les grands totaux : 1234 -> 1,23k ; 3111001 -> 3,11M.
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

function TopAlbumsTable({ albums = [] }) {
  const navigate = useNavigate();

  return (
    <section className="w-full rounded-xl border-2 border-black bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black">Dossiers les plus actifs</h3>
          <p className="mt-1 text-sm font-bold text-neutral-500">Classement par vues et telechargements.</p>
        </div>
        <FolderOpen size={20} />
      </div>

      {albums.length === 0 ? (
        <div className="grid min-h-40 place-items-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-5 text-center text-sm font-extrabold text-neutral-500">
          Aucune activite album pour le moment.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 max-[760px]:grid-cols-1">
          {albums.map((album, index) => (
            <button
              key={album.id}
              type="button"
              className="grid min-w-0 grid-cols-[38px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-neutral-300 bg-white p-3 text-left transition hover:border-[#9cff00] hover:ring-2 hover:ring-[#9cff00]/70"
              onClick={() => navigate(`/albums/${album.slug}`)}
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-black text-sm font-black text-[#9cff00]">
                {index + 1}
              </span>
              <span className="min-w-0">
                <strong className="block truncate font-black">{album.title}</strong>
                <span className="mt-0.5 block truncate text-xs font-bold text-neutral-500">{album.event?.title}</span>
              </span>
              <span className="flex items-center gap-2 text-xs font-black text-neutral-700">
                <span className="inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-neutral-100 px-2 py-1" title={formatNumber(album.views)}>
                  <Eye size={13} />
                  {formatCompactCount(album.views)}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#9cff00] px-2 py-1 text-black" title={formatNumber(album.downloads)}>
                  <ArrowDownToLine size={13} />
                  {formatCompactCount(album.downloads)}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export default TopAlbumsTable;
