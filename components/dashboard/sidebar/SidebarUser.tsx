import { LogOut } from 'lucide-react';

export function SidebarUser({ userEmail, onLogout }: {
  userEmail: string;
  onLogout: () => void;
}) {
  return (
    <div className="sidebar-user">
      <button className="logout-button" onClick={onLogout} title="Logout">
        <LogOut size={16} />
      </button>
      <span className="user-email">{userEmail}</span>
    </div>
  );
}