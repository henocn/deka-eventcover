import {
  BarChart3,
  ChevronRight,
  FileImage,
  FolderKanban,
  LogOut,
  Upload,
  Users,
} from 'lucide-react';

function Sidebar({ activeView, onNavigate, onLogout }) {
  return (
    <aside className="admin-sidebar">
      <div>
        <div className="brand-row">
          <strong>Deka.</strong>
          <button type="button" className="collapse-button" title="Reduire">
            <ChevronRight size={16} />
          </button>
        </div>
        <nav className="sidebar-menu" aria-label="Navigation principale">
          <button type="button" className={activeView === 'events' || activeView === 'details' ? 'active' : ''} onClick={() => onNavigate('events')}>
            <FolderKanban size={20} />
            Evenements
          </button>
          <button type="button" className={activeView === 'albums' || activeView === 'albumDetails' ? 'active' : ''} onClick={() => onNavigate('albums')}>
            <FileImage size={20} />
            Albums
          </button>
          <button type="button" disabled>
            <Upload size={20} />
            Uploads
          </button>
          <button type="button" disabled>
            <BarChart3 size={20} />
            Analytics
          </button>
          <button type="button" disabled>
            <Users size={20} />
            Utilisateurs
          </button>
        </nav>
      </div>

      <button type="button" className="sidebar-logout" onClick={onLogout}>
        <LogOut size={20} />
        Log out
      </button>
    </aside>
  );
}

export default Sidebar;
