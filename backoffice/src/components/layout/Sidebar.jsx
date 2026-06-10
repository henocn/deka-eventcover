import {
  BarChart3,
  ChevronRight,
  FileImage,
  FolderKanban,
  LogOut,
  Users,
} from 'lucide-react';
import { NavLink, useMatch } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

function Sidebar({ onLogout }) {
  const { user } = useAuth();
  const eventsMatch = useMatch('/events');
  const eventDetailsMatch = useMatch('/event/:slug');
  const albumsMatch = useMatch('/albums');
  const albumDetailsMatch = useMatch('/albums/:slug');
  const analyticsMatch = useMatch('/analytics');
  const usersMatch = useMatch('/users');
  const isEventSection = Boolean(eventsMatch || eventDetailsMatch);
  const isAlbumSection = Boolean(albumsMatch || albumDetailsMatch);
  const canManageUsers = user?.role === 'super_admin';

  return (
    <aside className="sticky top-0 flex h-svh min-h-svh flex-col justify-between bg-black px-5 py-6 text-white max-[1180px]:px-3 max-[1180px]:py-5 max-[760px]:static max-[760px]:h-auto max-[760px]:min-h-0 max-[760px]:flex-row max-[760px]:items-center max-[760px]:overflow-x-auto max-[760px]:px-3 max-[760px]:py-2.5">
      <div>
        <div className="flex items-center justify-between gap-3 border-b border-neutral-800 pb-5 max-[760px]:border-b-0 max-[760px]:pb-0">
          <strong className="block text-[30px] font-black text-[#9cff00] max-[1180px]:text-xl">Deka.</strong>
          <button type="button" className="grid h-8 w-8 place-items-center rounded bg-neutral-900 text-white max-[1180px]:hidden" title="Reduire">
            <ChevronRight size={16} />
          </button>
        </div>
        <nav className="mt-8 grid gap-2.5 max-[760px]:ml-3 max-[760px]:mt-0 max-[760px]:grid-flow-col max-[760px]:auto-cols-[44px]" aria-label="Navigation principale">
          <NavLink to="/analytics" className={`flex min-h-[46px] items-center gap-3 rounded-md px-4 text-base font-bold no-underline max-[1180px]:justify-center max-[1180px]:p-0 max-[1180px]:text-[0px] ${analyticsMatch ? 'bg-[#9cff00] text-black' : 'text-neutral-300'}`}>
            <BarChart3 size={20} />
            Dashboard
          </NavLink>
          <NavLink to="/events" className={`flex min-h-[46px] items-center gap-3 rounded-md px-4 text-base font-bold no-underline max-[1180px]:justify-center max-[1180px]:p-0 max-[1180px]:text-[0px] ${isEventSection ? 'bg-[#9cff00] text-black' : 'text-neutral-300'}`}>
            <FolderKanban size={20} />
            Evenements
          </NavLink>
          <NavLink to="/albums" className={`flex min-h-[46px] items-center gap-3 rounded-md px-4 text-base font-bold no-underline max-[1180px]:justify-center max-[1180px]:p-0 max-[1180px]:text-[0px] ${isAlbumSection ? 'bg-[#9cff00] text-black' : 'text-neutral-300'}`}>
            <FileImage size={20} />
            Albums
          </NavLink>
          {canManageUsers ? (
            <NavLink to="/users" className={`flex min-h-[46px] items-center gap-3 rounded-md px-4 text-base font-bold no-underline max-[1180px]:justify-center max-[1180px]:p-0 max-[1180px]:text-[0px] ${usersMatch ? 'bg-[#9cff00] text-black' : 'text-neutral-300'}`}>
              <Users size={20} />
              Utilisateurs
            </NavLink>
          ) : null}
        </nav>
      </div>

      <button type="button" className="flex min-h-[46px] items-center gap-3 rounded-md px-4 text-base font-bold text-white max-[1180px]:justify-center max-[1180px]:p-0 max-[1180px]:text-[0px] max-[760px]:ml-auto max-[760px]:min-w-11" onClick={onLogout}>
        <LogOut size={20} />
        Log out
      </button>
    </aside>
  );
}

export default Sidebar;
