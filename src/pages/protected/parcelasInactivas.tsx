import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

interface Parcela {
  id: number;
  nombre: string;
  ubicacion: string;
  responsable: string;
  cultivo: string;
  estado: boolean;
  lat: number;
  long: number;
  temperatura?: number;
  humedad?: number;
  lluvia?: number;
  sol?: number;
  ultimo_riego?: string;
}

const API_URL = "http://localhost:3001/parcelas-inactivas";

export const InactiveParcelsComponent: React.FC = () => {
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const navigate = useNavigate();

  const fetchParcelas = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) return;

      const data: Parcela[] = await response.json();
      setParcelas(data);
    } catch (error) {
      console.error("Error al obtener parcelas:", error);
    }
  };

  useEffect(() => {
    fetchParcelas();
    const intervalId = setInterval(fetchParcelas, 40000);
    return () => clearInterval(intervalId);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    navigate("/");
  };

  const parcelasInactivas = parcelas.filter((p) => !p.estado);

  // 🔍 Filtrado por búsqueda
  const filteredParcelas = parcelasInactivas.filter((p) =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredParcelas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredParcelas.length / itemsPerPage);

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

      <div className="inactivo-content dashboard-content">
        <h2>Parcelas Eliminadas</h2>

        {/* Buscador */}
        <div className="search-bar my-4">
          <input
            type="text"
            placeholder="🔍 Buscar por nombre de parcelas"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset de página
            }}
            className="search-input p-2 border rounded w-full max-w-sm"
          />
        </div>

        {currentItems.length > 0 ? (
          <div className="inactivo-grid">
            {currentItems.map((parcela) => (
              <div key={parcela.id} className="parcela-card">
                <p><strong>Nombre de parcela:</strong> {parcela.nombre}</p>
                <p><strong>Ubicación:</strong> {parcela.ubicacion}</p>
                <p><strong>Responsable:</strong> {parcela.responsable}</p>
                <p><strong>Cultivo:</strong> {parcela.cultivo}</p>
                <p>
                  <strong>Último Riego:</strong>{" "}
                  {parcela.ultimo_riego
                    ? new Date(parcela.ultimo_riego).toLocaleString("es-ES", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })
                    : "No disponible"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data-message">No hay parcelas eliminadas.</p>
        )}

        {filteredParcelas.length > itemsPerPage && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
