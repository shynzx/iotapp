import React, { useEffect, useState } from "react";

interface Zona {
  id: number;
  nombre: string;
  sector: string;
  estado: string;
  motivo: string | null;
  fecha: string;
}

const estadosFueraDeServicio = ["mantenimiento", "descompuesto", "fuera_de_servicio"];

export const ZonasSinFuncionamiento: React.FC = () => {
  const [zonasOriginales, setZonasOriginales] = useState<Zona[]>([]);
  const [zonasFiltradas, setZonasFiltradas] = useState<Zona[]>([]);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<string>("todas");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchZonas = async () => {
    try {
      const response = await fetch("http://localhost:3001/zonas");
      const data: Zona[] = await response.json();
      setZonasOriginales(data);
      setZonasFiltradas(data.filter(z => estadosFueraDeServicio.includes(z.estado)));
    } catch (err) {
      console.error("Error al obtener zonas:", err);
      setError("No se pudo cargar la lista de zonas.");
    } finally {
      setLoading(false);
    }
  };

  const filtrarZonas = (estado: string) => {
    setEstadoSeleccionado(estado);

    let filtradas = [...zonasOriginales];

    if (estado !== "todas") {
      filtradas = filtradas.filter(z => z.estado === estado);
    } else {
      filtradas = filtradas.filter(z => estadosFueraDeServicio.includes(z.estado));
    }

    filtradas.sort((a, b) => a.estado.localeCompare(b.estado)); // orden alfabético

    setZonasFiltradas(filtradas);
  };

  useEffect(() => {
    fetchZonas();
  }, []);

  if (loading) return <p>Cargando zonas...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (zonasFiltradas.length === 0) return <p>Todas las zonas están funcionando correctamente ✅</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h3>Zonas de Riego Fuera de Servicio</h3>

      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="estado-select"><strong>Filtrar por estado: </strong></label>
        <select
          id="estado-select"
          value={estadoSeleccionado}
          onChange={(e) => filtrarZonas(e.target.value)}
          style={{ marginLeft: "10px", padding: "6px", borderRadius: "5px" }}
        >
          <option value="todas">Todos</option>
          <option value="mantenimiento">Mantenimiento</option>
          <option value="descompuesto">Descompuesto</option>
          <option value="fuera_de_servicio">Fuera de servicio</option>
        </select>
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {zonasFiltradas.map(zona => (
          <li key={zona.id} style={{
            marginBottom: "1rem",
            padding: "1rem",
            backgroundColor: "#141419",
            borderRadius: "8px",
            borderLeft: `6px solid ${
              zona.estado === "mantenimiento"
                ? "#FFA500"
                : zona.estado === "descompuesto"
                ? "#FF0000"
                : "#800080"
            }`
          }}>
            <p><strong>🧭 Nombre:</strong> {zona.nombre}</p>
            <p><strong>🆔 Sector:</strong> {zona.sector}</p>
            <p><strong>⚠️ Estado:</strong> {zona.estado}</p>
            <p><strong>🛠️ Motivo:</strong> {zona.motivo ?? "No especificado"}</p>
            <p><strong>📅 Fecha:</strong> {new Date(zona.fecha).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};
