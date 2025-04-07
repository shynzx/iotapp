import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import '../../styles/dashboardStyle.css'; 
import Swal from "sweetalert2";
import { MapComponent } from '../../hooks/zonasMapa';  
import { ZonasSinFuncionamiento } from "../../components/ZonasSinFuncionamiento";
import { ZonasPorEstadoPieChart } from "../../components/ZonasPorEstadoPieChart";




export default function ZonasMapas() { 
  const navigate = useNavigate();
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("user_role");
    if (storedRole) {
      setUserRole(storedRole);
    } 

    fetchLastUpdate();

    const interval = setInterval(() => {
      fetchLastUpdate();
      setRefreshTrigger(prev => !prev);
    }, 60000);

    return () => clearInterval(interval);
  }, [navigate]);

  const fetchLastUpdate = async () => {
    try {
      const response = await fetch("http://localhost:3001/actualizaciones");

      const contentType = response.headers.get("content-type");

      if (!response.ok || !contentType?.includes("application/json")) {
        throw new Error("Respuesta inválida de la API");
      }

      const data = await response.json();

      if (data?.ultima_actualizacion) {
        setLastUpdate(new Date(data.ultima_actualizacion).toLocaleString());
      }
    } catch (error) {
      console.error("Error al obtener la última actualización:", error);
      setLastUpdate("No disponible");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    navigate("/");
  };

  const handleUpdateParcelas = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch("http://localhost:3001/update-data");
      const contentType = response.headers.get("content-type");

      if (response.ok && contentType?.includes("application/json")) {
        await fetchLastUpdate();
        Swal.fire({
          icon: "success",
          title: "Datos actualizados",
          text: "Los datos se han actualizado correctamente.",
          confirmButtonText: "Aceptar",
        });
        setRefreshTrigger((prev) => !prev);
      } else {
        throw new Error("Respuesta inválida del servidor");
      }
    } catch (error) {
      console.error("Error al actualizar datos:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al actualizar los datos.",
        confirmButtonText: "Aceptar",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="siderbar">
        <header className="siderbar-header">
          <h1 className="siderbar-title">Dashboard</h1>
        </header>
        <section className="siderbar-content">
          <nav className="siderbar-nav">
            <ul className="siderbar-menu">
              <li className="siderbar-item">
                <a href="/dashboard">Mapa</a>
              </li>
              <li className="siderbar-item">
                <a href="/sensores">Historial de parcelas</a>
              </li>
              <li className="siderbar-item">
                <a href="/graficas">Métricas</a>
              </li>
              <li className="siderbar-item">
                <a href="/parcelasInactivas">Parcelas eliminadas</a>
              </li>
              <li className="siderbar-item"><a href="/ia">Asistente virtual</a></li>
              <li className="siderbar-item"><a href="/zonas">Zonas de riego</a></li>
              <li className="siderbar-item logout-btn">
                <button onClick={handleLogout} className="logout-btn">
                  Salir
                </button>
              </li>
            </ul>
          </nav>
        </section>
      </aside>

      <div className="dashboard-content">
        <h2>Cultivos del sur | Mapa de zonas de riego</h2>

        <div className="update-container">
          <p>
            Última actualización del mapa: {lastUpdate ?? "No disponible"}
          </p>
          <button 
            onClick={handleUpdateParcelas} 
            disabled={isUpdating} 
            className="update-button"
          >
            {isUpdating ? "Actualizando..." : "Actualizar"} 
          </button>
        </div>

        <div className="mapa-container">
          <MapComponent refreshTrigger={refreshTrigger} />
        </div>
        <div className="zonas-status-container">
  <ZonasSinFuncionamiento />
</div>
<div className="graficos-zonas-container">
  <ZonasPorEstadoPieChart />
</div>

      </div>
    </div>
  );
}
