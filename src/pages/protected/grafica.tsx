import { SensorCharts } from "../../components/SensorCharts";
import UsuarioIcon from "../../assets/usuario.svg";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

function Graficas() {
  const navigate = useNavigate(); // Mover useNavigate dentro del componente funcional

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="graficas-layout">
      {/* Sidebar */}
      <aside className="siderbar">
        <header className="siderbar-header">
          <h1 className="siderbar-title">Mapa</h1>
        </header>
        <section className="siderbar-content">
          <nav className="siderbar-nav">
            <ul className="siderbar-menu">
              <li className="siderbar-item">
                <a href="/dashboard">Inicio</a>
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

      {/* Content Area */}
      <div className="graficas-content">
        <div className="sensor-chart">
          <SensorCharts />
        </div>
      </div>
    </div>
  );
}

export default Graficas;