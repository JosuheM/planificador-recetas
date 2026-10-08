// Cuadro de confirmación propio (reemplaza al confirm() del navegador)
export default function Confirmar({ titulo, mensaje, textoSi = 'Aceptar', peligro = false, onSi, onNo }) {
  return (
    <div className="modal-bg" onMouseDown={(e) => e.target === e.currentTarget && onNo()}>
      <div className="modal card confirmar" role="dialog" aria-modal="true">
        <h2>{titulo}</h2>
        {mensaje && <p className="muted">{mensaje}</p>}
        <div className="row end">
          <button className="btn ghost" onClick={onNo}>Cancelar</button>
          <button className={`btn ${peligro ? 'btn-peligro' : ''}`} onClick={onSi} autoFocus>{textoSi}</button>
        </div>
      </div>
    </div>
  );
}
