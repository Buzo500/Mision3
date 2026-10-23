export default function FiltroCategoria({ categorias, categoria, cargando, onCambiar }) {
  return (
    <div className="campo-categoria">
      <label htmlFor="categoria">Categoría</label>
      <select id="categoria" value={categoria} disabled={cargando || categorias.length === 0}
        onChange={(evento) => onCambiar(evento.target.value)}>
        <option value="">Todas las categorías</option>
        {categorias.map((grupo) => (
          <option key={grupo.categoria} value={grupo.categoria}>
            {grupo.categoria} ({grupo.cantidad})
          </option>
        ))}
      </select>
    </div>
  );
}
