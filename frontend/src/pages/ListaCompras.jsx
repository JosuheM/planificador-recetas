import { useEffect, useState } from 'react';
import api, { mensajeError } from '../api.js';
import Confirmar from '../components/Confirmar.jsx';

export default function ListaCompras() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [confirmando, setConfirmando] = useState(false);

  const cargar = () => api.get('/lista-compras').then((r) => setItems(r.data)).catch((e) => setError(mensajeError(e)));
  useEffect(() => { cargar(); }, []);

  const marcar = async (item) => {
    // Actualización optimista (se revierte si falla la API)
    setItems(items.map((i) => (i.id === item.id ? { ...i, comprado: !i.comprado } : i)));
    try {
      await api.patch(`/lista-compras/${item.id}`, { comprado: !item.comprado });
    } catch (e) {
      setError(mensajeError(e));
      cargar();
    }
  };

  const regenerar = async () => {
    setError('');
    try {
      await api.post('/lista-compras/generar');
      cargar();
    } catch (e) {
      setError(mensajeError(e));
    }
  };

  const vaciar = async () => {
    await api.delete('/lista-compras');
    setItems([]);
    setConfirmando(false);
  };

  const hechos = items.filter((i) => i.comprado).length;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Lista de compras</h1>
          <p className="muted">Ingredientes sumados de todo tu plan</p>
        </div>
        <div className="row">
          <button className="btn" onClick={regenerar}>↻ Regenerar desde el plan</button>
          {!!items.length && <button className="btn ghost danger" onClick={() => setConfirmando(true)}>Vaciar</button>}
        </div>
      </div>
      {confirmando && (
        <Confirmar
          titulo="¿Vaciar la lista de compras?"
          mensaje="Se borrarán todos los ingredientes. Puedes volver a generarla desde el plan."
          textoSi="Vaciar"
          peligro
          onSi={vaciar}
          onNo={() => setConfirmando(false)}
        />
      )}
      {error && <div className="error">{error}</div>}
      {!items.length ? (
        <div className="card empty">Tu lista está vacía. Arma tu plan semanal y genera la lista.</div>
      ) : (
        <div className="card">
          <div className="resumen">
            <span>{hechos} de {items.length} comprados</span>
            <span className="muted">{Math.round((hechos / items.length) * 100)}%</span>
          </div>
          <div className="progress"><div style={{ width: `${(hechos / items.length) * 100}%` }} /></div>
          <ul className="compras">
            {items.map((i) => (
              <li key={i.id} className={i.comprado ? 'hecho' : ''}>
                <label>
                  <input type="checkbox" checked={i.comprado} onChange={() => marcar(i)} />
                  <span className="nombre">{i.ingrediente}</span>
                  <span className="cant">{i.cantidad} {i.unidad}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
