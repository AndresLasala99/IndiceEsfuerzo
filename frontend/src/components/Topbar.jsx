import { useAuth } from '../AuthContext.jsx';

export default function Topbar({ children }) {
  const { logout } = useAuth();
  return (
    <header className="topbar">
      <div className="topbar__left">{children}</div>
      <button type="button" className="link-btn" onClick={logout}>Cerrar sesión</button>
    </header>
  );
}
