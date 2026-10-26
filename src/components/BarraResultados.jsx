export default function BarraResultados({ categorias, soloFavoritas, favoritasEnBusqueda, onCambiarFavoritas }) {
  return (
    <div className="barra-resultados">
      <div className="resumen">
        <p>En esta búsqueda</p>
        <ul aria-label="Recetas por categoría">
          {categorias.map((grupo) => (
            <li key={grupo.categoria}><span>{grupo.categoria}</span><strong>{grupo.cantidad}</strong></li>
          ))}
        </ul>
      </div>
      <label className="filtro-favoritas">
        <input type="checkbox" checked={soloFavoritas}
          onChange={(evento) => onCambiarFavoritas(evento.target.checked)} />
        Solo favoritas de esta búsqueda ({favoritasEnBusqueda})
      </label>
    </div>
  );
}
