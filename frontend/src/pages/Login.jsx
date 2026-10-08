import { useState } from 'react';
import { useAuth } from '../auth.jsx';
import { mensajeError } from '../api.js';

export default function Login() {
  const { login, registro } = useAuth();
  const [modoRegistro, setModoRegistro] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      if (modoRegistro) await registro(form.nombre, form.email, form.password);
      else await login(form.email, form.password);
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-wrap">
      <section className="hero">
        <h1>Planifica tu semana, compra solo lo necesario.</h1>
        <p>Guarda tus recetas, asígnalas a cada día y obtén la lista de compras con los ingredientes ya sumados.</p>
        <ul>
          <li>📖 Guarda tus recetas con cantidades</li>
          <li>🗓️ Arma el menú de lunes a domingo</li>
          <li>🛒 Genera la lista de compras con un clic</li>
        </ul>
      </section>
      <div className="login-side">
        <form className="card login" onSubmit={enviar}>
          <h2>{modoRegistro ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}</h2>
          <p className="muted">{modoRegistro ? 'Solo toma un minuto.' : 'Inicia sesión para continuar.'}</p>
          {modoRegistro && (
            <label>Nombre
              <input name="nombre" value={form.nombre} onChange={cambiar} required />
            </label>
          )}
          <label>Email
            <input name="email" type="email" value={form.email} onChange={cambiar} required />
          </label>
          <label>Contraseña
            <input name="password" type="password" value={form.password} onChange={cambiar} required minLength={6} />
          </label>
          {error && <div className="error">{error}</div>}
          <button className="btn" disabled={cargando}>
            {cargando ? 'Un momento…' : modoRegistro ? 'Registrarme' : 'Entrar'}
          </button>
          <button type="button" className="link" onClick={() => { setModoRegistro(!modoRegistro); setError(''); }}>
            {modoRegistro ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
        </form>
      </div>
    </div>
  );
}
