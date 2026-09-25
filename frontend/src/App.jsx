import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import PlayerHome from './pages/PlayerHome.jsx';
import AdminHome from './pages/AdminHome.jsx';

const homeFor = (user) => (user.role === 'admin' ? '/admin' : '/jugador');

function Protected({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={homeFor(user)} replace />;
  return children;
}

function PublicOnly({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to={homeFor(user)} replace /> : children;
}

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <div className="splash" aria-busy="true">Cargando…</div>;

  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/registro" element={<PublicOnly><Register /></PublicOnly>} />
      <Route path="/registro-admin" element={<PublicOnly><Register admin /></PublicOnly>} />
      <Route path="/jugador" element={<Protected role="player"><PlayerHome /></Protected>} />
      <Route path="/admin" element={<Protected role="admin"><AdminHome /></Protected>} />
      <Route path="*" element={<Navigate to={user ? homeFor(user) : '/login'} replace />} />
    </Routes>
  );
}
