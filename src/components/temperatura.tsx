import React, { useEffect, useState } from 'react';
import Soleado from '../assets/soleado.png';
import Nubes from '../assets/nube.png';
import Tempera from '../assets/temperatura-alta.png';
import Humedad from '../assets/humedad.png';

const API_URL = 'http://localhost:3001/sensores-globales';

interface SensorGlobal {
  id: number;
  humedad: number;
  temperatura: number;
  lluvia: number;
  sol: number;
}

interface TemperaturaProps {
  refreshTrigger: boolean; // Prop para actualización manual
}

export default function Temperatura({ refreshTrigger }: TemperaturaProps) {
  const [datos, setDatos] = useState<{
    temperatura: number | null;
    humedad: number | null;
    lluvia: number | null;
    intensidadSolar: number | null;
  }>({
    temperatura: null,
    humedad: null,
    lluvia: null,
    intensidadSolar: null,
  });

  const fetchData = async () => {
    try {
      const response = await fetch(API_URL);
      const sensoresGlobales: SensorGlobal[] = await response.json();

      if (sensoresGlobales.length > 0) {
        const temperaturaPromedio =
          sensoresGlobales.reduce((acc, sensor) => acc + sensor.temperatura, 0) /
          sensoresGlobales.length;

        const humedadPromedio =
          sensoresGlobales.reduce((acc, sensor) => acc + sensor.humedad, 0) /
          sensoresGlobales.length;

        const lluviaPromedio =
          sensoresGlobales.reduce((acc, sensor) => acc + sensor.lluvia, 0) /
          sensoresGlobales.length;

        const intensidadSolarPromedio =
          sensoresGlobales.reduce((acc, sensor) => acc + sensor.sol, 0) /
          sensoresGlobales.length;

        setDatos({
          temperatura: parseFloat(temperaturaPromedio.toFixed(1)),
          humedad: parseFloat(humedadPromedio.toFixed(1)),
          lluvia: parseFloat(lluviaPromedio.toFixed(1)),
          intensidadSolar: parseFloat(intensidadSolarPromedio.toFixed(1)),
        });
      }
    } catch (error) {
      console.error('Error al obtener datos:', error);
    }
  };

  // Llamar a fetchData al cargar el componente o cuando cambie refreshTrigger
  useEffect(() => {
    fetchData();
  }, [refreshTrigger]); // Escucha cambios en refreshTrigger

  return (
    <div className="cards_container">
      <div className="card">
        <h2>Temperatura</h2>
        <img src={Tempera} alt="Temperatura" className="temperatura-icon imagen" />
        <p>{datos.temperatura !== null ? `${datos.temperatura}°C` : 'Cargando...'}</p>
      </div>
      <div className="card">
        <h2>Humedad</h2>
        <img src={Humedad} alt="Humedad" className="humedad-icon imagen" />
        <p>{datos.humedad !== null ? `${datos.humedad}%` : 'Cargando...'}</p>
      </div>
      <div className="card">
        <h2>Lluvia</h2>
        <img src={Nubes} alt="Nubes" className="nubes-icon imagen" />
        <p>{datos.lluvia !== null ? `${datos.lluvia} mm` : 'Cargando...'}</p>
      </div>
      <div className="card">
        <h2>Intensidad Solar</h2>
        <img src={Soleado} alt="Soleado" className="soleado-icon imagen" />
        <p>{datos.intensidadSolar !== null ? `${datos.intensidadSolar}%` : 'Cargando...'}</p>
      </div>
    </div>
  );
}