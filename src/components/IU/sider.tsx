
import '../../styles/dashboardStyle.css'; 

export default function Sider() {
    return (
      <aside className="sidebar">
        <header className="sidebar-header">
          <h1 className="sidebar-title">Dashboard</h1>
        </header>
        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            <li className="sidebar-item">
              <a href="/">Salir</a>
            </li>
          </ul>
        </nav>
      </aside>
    );
  }
  