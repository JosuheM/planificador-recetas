import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import Login from './pages/Login.jsx';
import Recetas from './pages/Recetas.jsx';
import Planificador from './pages/Planificador.jsx';
import ListaCompras from './pages/ListaCompras.jsx';

function Privada({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function Layout({ children }) {
  const { user, logout } = useAuth();
  return (
    <>
      <header className="topbar">
        <span className="logo">🥘 Planificador</span>
        <nav>
          <NavLink to="/recetas">Recetas</NavLink>
          <NavLink to="/planificador">Planificador</NavLink>
          <NavLink to="/lista-compras">Compras</NavLink>
        </nav>
        <div className="user">
          <span className="avatar" title={user.nombre}>{user.nombre.charAt(0)}</span>
          <button className="btn ghost small" onClick={logout}>Salir</button>
        </div>
      </header>
      <main className="container">{children}</main>
    </>
  );
}

export default function App() {
  const { user } = useAuth();
  const privada = (el) => (
    <Privada>
      <Layout>{el}</Layout>
    </Privada>
  );
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/recetas" replace /> : <Login />} />
      <Route path="/recetas" element={privada(<Recetas />)} />
      <Route path="/planificador" element={privada(<Planificador />)} />
      <Route path="/lista-compras" element={privada(<ListaCompras />)} />
      <Route path="*" element={<Navigate to="/recetas" replace />} />
    </Routes>
  );
}
