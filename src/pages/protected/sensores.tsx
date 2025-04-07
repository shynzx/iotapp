import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

interface HistorialSensor {
  parcela_id: number;
  nombre_parcela: string;
  temperatura: number;
  humedad: number;
  lluvia: number;
  sol: number;
  fecha: string;
}

const API_URL = "http://localhost:3001/historial-sensores";

export const SensoresComponent: React.FC = () => {
  const [historial, setHistorial] = useState<HistorialSensor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }
        const data: HistorialSensor[] = await response.json();
        setHistorial(data);
      } catch (err) {
        const error = err as Error;
        setError(error.message);
        console.error("Error al obtener el historial de sensores:", error);
      }
    };

    fetchHistorial();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    navigate("/");
  };

  // 🔍 Filtrar por nombre de parcela
  const filteredHistorial = historial.filter((registro) =>
    registro.nombre_parcela.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredHistorial.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredHistorial.length / itemsPerPage);

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="dashboard-layout">
      <aside className="siderbar">
        <header className="siderbar-header">
          <h1 className="siderbar-title">Dashboard</h1>
        </header>
        <section className="siderbar-content">
          <nav className="siderbar-nav">
            <ul className="siderbar-menu">
              <li className="siderbar-item"><a href="/dashboard">Mapa</a></li>
              <li className="siderbar-item"><a href="/sensores">Historial de parcelas</a></li>
              <li className="siderbar-item"><a href="/graficas">Métricas</a></li>
              <li className="siderbar-item"><a href="/parcelasInactivas">Parcelas eliminadas</a></li>
              <li className="siderbar-item"><a href="/ia">Asistente virtual</a></li>
              <li className="siderbar-item"><a href="/zonas">Zonas de riego</a></li>
              <li className="siderbar-item logout-btn">
                <button onClick={handleLogout} className="logout-btn">Salir</button>
              </li>
            </ul>
          </nav>
        </section>
      </aside>

      <div className="sensores-content dashboard-content">
        <h2>Historial de Parcelas</h2>

        {/* 🔍 Buscador */}
        <div className="search-bar my-4">
          <input
            type="text"
            placeholder="🔍 Buscar por nombre de parcela"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset de página si se busca
            }}
            className="search-input p-2 border rounded w-full max-w-sm"
          />
        </div>

        {currentItems.length > 0 ? (
          <div className="sensores-grid">
            {currentItems.map((registro, index) => (
              <div key={index} className="sensor-card">
                <p><strong>Parcela:</strong> {registro.nombre_parcela}</p>
                <p><strong>Temperatura:</strong> {registro.temperatura}°C</p>
                <p><strong>Humedad:</strong> {registro.humedad}%</p>
                <p><strong>Lluvia:</strong> {registro.lluvia}mm</p>
                <p><strong>Sol:</strong> {registro.sol}%</p>
                <p><strong>Fecha:</strong> {new Date(registro.fecha).toLocaleString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No hay datos de sensores disponibles.</p>
        )}

        {/* 📄 Paginación */}
        {filteredHistorial.length > itemsPerPage && (
          <div className="pagination">
            <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
              Anterior
            </button>
            <span>Página {currentPage} de {totalPages}</span>
            <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
