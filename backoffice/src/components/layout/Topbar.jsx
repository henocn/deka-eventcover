import { getInitials } from '../../utils/eventUtils';

function Topbar({ user }) {
  return (
    <header className="admin-topbar compact">
      <div>
        <h1>Evenements</h1>
      </div>
      <div className="profile-pill" title={user.fullName}>
        <span>{getInitials(user.fullName)}</span>
      </div>
    </header>
  );
}

export default Topbar;
