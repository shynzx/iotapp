import React, { useEffect, useRef } from 'react';
import '../../styles/dashboardStyle.css'; 
import mapboxgl from 'mapbox-gl';
import Clima from '../../hooks/clima';
import UsuarioIcon from "../../assets/usuario.svg";



// Asigna el token desde las variables de entorno
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN || '';

const MapComponent: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current!,
      center: [-86.8515, 21.1619], // Centro del mapa en Cancún
      zoom: 12,
      attributionControl: false,
    });

    map.on('load', () => {
      map.addSource('mosaico', {
        type: 'raster',
        tiles: [
          `https://api.mapbox.com/v4/shynzx.cm889dbax14me1po0puf9cfnc-6e2u7/{z}/{x}/{y}.png?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`
        ],
        tileSize: 256
      });

      map.addLayer({
        id: 'capa-mosaico',
        type: 'raster',
        source: 'mosaico',
        paint: { 'raster-opacity': 0 }
      });
    });

    return () => map.remove();
  }, []);

  return <div ref={mapContainerRef} style={{ width: '50%', height: '300px' }} />;
};

export default function Dashboard() {
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
                <a href="/">Salir</a>
              </li>
            </ul>
          </nav>
        </section>
      </aside>
      
      <div className="dashboard-content">
        <div className='navbar-usuario'>
      <img src={UsuarioIcon} alt="Icono de usuario" className="navbar-icon" />
      </div>
        <div className='mapa-container'>
          <h2 className="mapa-title">Mapa</h2>
        <MapComponent />
        <Clima></Clima>
        </div>
        <div>
      
        </div>
      </div>
    </div>
  );
}
