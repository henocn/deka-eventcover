import { ArrowDownToLine, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

// Liste des dossiers les plus actifs, avec grille 2 colonnes et bordures visibles.
function TopAlbumsTable({ albums = [] }) {
  const navigate = useNavigate();
  const totalRows = Math.ceil(albums.length / 2);

  return (
    <section className="w-full rounded-lg border border-black bg-white">
      <div className="flex items-end justify-between gap-3 border-b border-black/20 px-5 py-4">
        <div>
          <h3 className="text-base font-semibold text-neutral-950">Dossiers les plus actifs</h3>
          <p className="mt-0.5 text-sm text-neutral-500">Classe par vues et telechargements</p>
        </div>
      </div>

      {albums.length === 0 ? (
        <div className="grid min-h-36 place-items-center px-5 py-10 text-sm font-medium text-neutral-500">
          Aucune activite album pour le moment.
        </div>
      ) : (
        <div className="grid grid-cols-2 max-[760px]:grid-cols-1">
          {albums.map((album, index) => {
            const isLeftCol = index % 2 === 0;
            const rowIndex = Math.floor(index / 2);
            const isLastRow = rowIndex === totalRows - 1;

            return (
              <button
                key={album.id}
                type="button"
                className={`grid min-w-0 grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-left transition hover:bg-neutral-50 ${
                  isLeftCol && index !== albums.length - 1 ? 'border-r border-black/20 max-[760px]:border-r-0' : ''
                } ${!isLastRow ? 'border-b border-black/20' : ''} ${
                  index < albums.length - 1 ? 'max-[760px]:border-b max-[760px]:border-black/20' : ''
                }`}
                onClick={() => navigate(`/albums/${album.slug}`)}
              >
                <span className="grid h-6 w-6 place-items-center rounded-full border border-black bg-[#9cff00] text-[11px] font-semibold tabular-nums text-black">
                  {index + 1}
                </span>
                <span className="min-w-0">
                  <strong className="block truncate text-sm font-semibold text-neutral-900">{album.title}</strong>
                  <span className="mt-0.5 block truncate text-xs text-neutral-500">{album.event?.title}</span>
                </span>
                <span className="flex items-center gap-2 text-xs font-semibold text-neutral-800">
                  <span className="inline-flex items-center gap-1 rounded border border-black/25 bg-white px-1.5 py-0.5" title={formatNumber(album.views)}>
                    <Eye size={12} className="text-neutral-400" />
                    <strong className="font-semibold">{formatCompactCount(album.views)}</strong>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded border border-black/25 bg-neutral-50 px-1.5 py-0.5" title={formatNumber(album.downloads)}>
                    <ArrowDownToLine size={12} className="text-neutral-500" />
                    <strong className="font-semibold">{formatCompactCount(album.downloads)}</strong>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default TopAlbumsTable;
