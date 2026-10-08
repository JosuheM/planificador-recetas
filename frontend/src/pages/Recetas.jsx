import { useEffect, useState } from 'react';
import api, { mensajeError } from '../api.js';
import RecetaForm, { CATEGORIAS } from '../components/RecetaForm.jsx';
import Confirmar from '../components/Confirmar.jsx';
import { meta } from '../categorias.js';

export default function Recetas() {
  const [recetas, setRecetas] = useState([]);
  const [editando, setEditando] = useState(null); // null | 'nueva' | receta
  const [filtro, setFiltro] = useState('Todas');
  const [error, setError] = useState('');
  const [abierta, setAbierta] = useState(null);
  const [porBorrar, setPorBorrar] = useState(null);

  const cargar = () =>
    api.get('/recetas').then((r) => setRecetas(r.data)).catch((e) => setError(mensajeError(e)));
  useEffect(() => { cargar(); }, []);

  const borrar = async () => {
    await api.delete(`/recetas/${porBorrar.id}`);
    setPorBorrar(null);
    cargar();
  };

  const visibles = filtro === 'Todas' ? recetas : recetas.filter((r) => r.categoria === filtro);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Mis recetas</h1>
          <p className="muted">{recetas.length} guardadas</p>
        </div>
        <div className="row">
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option>Todas</option>
            {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
          </select>
          <button className="btn" onClick={() => setEditando('nueva')}>+ Nueva receta</button>
        </div>
      </div>
      {error && <div className="error">{error}</div>}
      {!visibles.length && !error && (
        <div className="card empty">Aún no tienes recetas aquí. ¡Crea la primera!</div>
      )}
      <div className="grid">
        {visibles.map((r) => (
          <article className={`card receta ${meta(r.categoria).clase}`} key={r.id}>
            <div className="receta-head">
              <h3>{r.nombre}</h3>
              <span className="chip">{meta(r.categoria).emoji} {r.categoria}</span>
            </div>
            <ul className="ings">
              {r.ingredientes.map((i) => (
                <li key={i.id}><b>{i.cantidad} {i.unidad}</b> <span>{i.nombre}</span></li>
              ))}
            </ul>
            {r.pasos && (
              <>
                <button className="link" onClick={() => setAbierta(abierta === r.id ? null : r.id)}>
                  {abierta === r.id ? 'Ocultar pasos' : 'Ver pasos'}
                </button>
                {abierta === r.id && <p className="pasos">{r.pasos}</p>}
              </>
            )}
            <div className="row end">
              <button className="btn ghost small" onClick={() => setEditando(r)}>Editar</button>
              <button className="btn ghost danger small" onClick={() => setPorBorrar(r)}>Eliminar</button>
            </div>
          </article>
        ))}
      </div>
      {porBorrar && (
        <Confirmar
          titulo={`¿Eliminar "${porBorrar.nombre}"?`}
          mensaje="También se quitará de tu plan semanal."
          textoSi="Eliminar"
          peligro
          onSi={borrar}
          onNo={() => setPorBorrar(null)}
        />
      )}
      {editando && (
        <RecetaForm
          receta={editando === 'nueva' ? null : editando}
          onCancelar={() => setEditando(null)}
          onGuardado={() => { setEditando(null); cargar(); }}
        />
      )}
    </>
  );
}
