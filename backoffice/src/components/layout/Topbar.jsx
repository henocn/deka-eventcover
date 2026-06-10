import { getInitials } from '../../utils/eventUtils';
import { useNavigate } from 'react-router-dom';

function Topbar({ user }) {
  const navigate = useNavigate();

  return (
    <header className="flex min-h-[68px] items-center justify-between border-b border-neutral-200 bg-white px-6 max-[760px]:min-h-[58px] max-[760px]:px-4">
      <div />
      <button
        type="button"
        className="grid h-9 w-9 place-items-center rounded-full bg-black text-xs font-black text-[#9cff00] transition hover:ring-2 hover:ring-[#9cff00]/70"
        title="Parametres du profil"
        onClick={() => navigate('/settings')}
      >
        <span>{getInitials(user.fullName)}</span>
      </button>
    </header>
  );
}

export default Topbar;
