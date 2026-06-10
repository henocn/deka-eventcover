import { Image as ImageIcon } from 'lucide-react';
import { getMediaUrl } from '../api';
import { albumCover } from '../utils/participantUtils';

function AlbumRail({ albums, selectedAlbumSlug, accessCode, accessRole, onSelectAlbum }) {
  return (
    <section className="album-section" aria-label="Albums">
      <div className="section-title-row">
        <div>
          <p className="eyebrow">Albums</p>
          <h2>Choisissez une collection</h2>
        </div>
      </div>

      <div className="album-strip">
        {albums.map((album, index) => {
          const cover = album.coverMedia
            ? getMediaUrl(album.coverMedia, accessCode, accessRole)
            : albumCover(album);

          return (
            <button
              key={album.id || album.slug}
              type="button"
              className={`album-card ${selectedAlbumSlug === album.slug ? 'is-active' : ''}`}
              onClick={() => onSelectAlbum(album.slug)}
              style={{ '--delay': `${index * 55}ms` }}
            >
              <span className="album-cover">
                {cover ? <img src={cover} alt="" loading="lazy" /> : <ImageIcon size={24} />}
                <span className="album-cover-shade" />
              </span>
              <span className="album-card-body">
                <span>
                  <span className="album-card-title">{album.title}</span>
                  <span className="album-card-desc">{album.description || 'Collection photo'}</span>
                </span>
                {album.mediaCount ? <span className="album-card-count">{album.mediaCount}</span> : null}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default AlbumRail;
