import { useState } from 'react';
import api, { mensajeError } from '../api.js';

export const CATEGORIAS = ['General', 'Desayuno', 'Almuerzo', 'Cena', 'Postre', 'Snack', 'Vegetariano'];
const UNIDADES = ['g', 'kg', 'ml', 'l', 'unidad', 'taza', 'cda', 'cdta'];
const vacio = { nombre: '', cantidad: '', unidad: 'g' };

export default function RecetaForm({ receta, onGuardado, onCancelar }) {
  const [nombre, setNombre] = useState(receta?.nombre || '');
  const [categoria, setCategoria] = useState(receta?.categoria || 'General');
  const [pasos, setPasos] = useState(receta?.pasos || '');
  const [ings, setIngs] = useState(receta?.ingredientes?.length ? receta.ingredientes : [{ ...vacio }]);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cambiarIng = (i, campo, valor) =>
    setIngs(ings.map((x, idx) => (idx === i ? { ...x, [campo]: valor } : x)));

  const guardar = async (e) => {
    e.preventDefault();
    setError('');
    setGuardando(true);
    const body = { nombre, categoria, pasos, ingredientes: ings.filter((i) => i.nombre.trim()) };
    try {
      if (receta) await api.put(`/recetas/${receta.id}`, body);
      else await api.post('/recetas', body);
      onGuardado();
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="modal-bg" onMouseDown={(e) => e.target === e.currentTarget && onCancelar()}>
      <form className="modal card" onSubmit={guardar}>
        <h2>{receta ? 'Editar receta' : 'Nueva receta'}</h2>
        <div className="row">
          <label className="grow">Nombre
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </label>
          <label>Categoría
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
        </div>

        <fieldset>
          <legend>Ingredientes</legend>
          {ings.map((i, idx) => (
            <div className="row ing" key={idx}>
              <input className="grow" placeholder="Ingrediente" value={i.nombre}
                onChange={(e) => cambiarIng(idx, 'nombre', e.target.value)} />
              <input type="number" min="0" step="any" placeholder="Cant." value={i.cantidad}
                onChange={(e) => cambiarIng(idx, 'cantidad', e.target.value)} />
              <select value={i.unidad} onChange={(e) => cambiarIng(idx, 'unidad', e.target.value)}>
                {UNIDADES.map((u) => <option key={u}>{u}</option>)}
              </select>
              <button type="button" className="btn ghost danger" title="Quitar"
                onClick={() => setIngs(ings.filter((_, k) => k !== idx))} disabled={ings.length === 1}>✕</button>
            </div>
          ))}
          <button type="button" className="btn ghost" onClick={() => setIngs([...ings, { ...vacio }])}>+ Ingrediente</button>
        </fieldset>

        <label>Pasos
          <textarea rows={5} value={pasos} onChange={(e) => setPasos(e.target.value)} />
        </label>

        {error && <div className="error">{error}</div>}
        <div className="row end">
          <button type="button" className="btn ghost" onClick={onCancelar}>Cancelar</button>
          <button className="btn" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar'}</button>
        </div>
      </form>
    </div>
  );
}
