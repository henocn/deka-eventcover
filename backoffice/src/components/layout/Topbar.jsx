import { getInitials } from '../../utils/eventUtils';

function Topbar({ user }) {
  return (
    <header className="flex min-h-[68px] items-center justify-between border-b border-neutral-200 bg-white px-6 max-[760px]:min-h-[58px] max-[760px]:px-4">
      <div />
      <div className="grid h-9 w-9 place-items-center rounded-full bg-black text-xs font-black text-[#9cff00]" title={user.fullName}>
        <span>{getInitials(user.fullName)}</span>
      </div>
    </header>
  );
}

export default Topbar;
