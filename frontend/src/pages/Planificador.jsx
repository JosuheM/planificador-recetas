import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { mensajeError } from '../api.js';
import { meta } from '../categorias.js';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const COMIDAS = ['desayuno', 'almuerzo', 'cena'];
const hoy = (new Date().getDay() + 6) % 7; // índice del día actual, 0 = lunes

export default function Planificador() {
  const [recetas, setRecetas] = useState([]);
  const [plan, setPlan] = useState([]);
  const [error, setError] = useState('');
  const [generando, setGenerando] = useState(false);
  const navigate = useNavigate();

  const cargarPlan = () => api.get('/plan').then((r) => setPlan(r.data));
  useEffect(() => {
    Promise.all([api.get('/recetas'), cargarPlan()])
      .then(([r]) => setRecetas(r.data))
      .catch((e) => setError(mensajeError(e)));
  }, []);

  const recetaEn = (dia, comida) => plan.find((p) => p.dia === dia && p.comida === comida)?.receta_id || '';

  // Cada comida muestra solo su categoría (Desayuno, Almuerzo, Cena) más las
  // categorías neutras (General, Vegetariano). La ya asignada siempre se conserva.
  const NEUTRAS = ['General', 'Vegetariano'];
  const opciones = (dia, comida) => {
    const actual = recetaEn(dia, comida);
    const cat = comida.charAt(0).toUpperCase() + comida.slice(1);
    return recetas.filter((r) => r.categoria === cat || NEUTRAS.includes(r.categoria) || r.id === actual);
  };

  const asignar = async (dia, comida, recetaId) => {
    try {
      if (recetaId) await api.put('/plan', { dia, comida, receta_id: recetaId });
      else await api.delete('/plan', { params: { dia, comida } });
      await cargarPlan();
    } catch (e) {
      setError(mensajeError(e));
    }
  };

  const generar = async () => {
    setError('');
    setGenerando(true);
    try {
      await api.post('/lista-compras/generar');
      navigate('/lista-compras');
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setGenerando(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Plan semanal</h1>
          <p className="muted">{plan.length} de 21 comidas planificadas</p>
        </div>
        <button className="btn" onClick={generar} disabled={generando || !plan.length}>
          🛒 Generar lista de compras
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      {!recetas.length && <div className="card empty">Primero crea algunas recetas para poder planificar.</div>}
      <div className="semana">
        {DIAS.map((d, dia) => (
          <section className={`card dia ${dia === hoy ? 'hoy' : ''}`} key={d}>
            <h3>{d}{dia === hoy && <span className="chip" style={{ marginLeft: 8 }}>Hoy</span>}</h3>
            {COMIDAS.map((c) => (
              <label key={c}>
                <span className="comida"><i>{meta(c.charAt(0).toUpperCase() + c.slice(1)).emoji}</i> {c}</span>
                <select value={recetaEn(dia, c)} onChange={(e) => asignar(dia, c, e.target.value)}>
                  <option value="">— Sin asignar —</option>
                  {opciones(dia, c).map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                </select>
              </label>
            ))}
          </section>
        ))}
      </div>
    </>
  );
}
