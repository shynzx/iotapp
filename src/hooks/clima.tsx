import React, { useEffect, useState } from "react";
import Sol from "../assets/dom.png";
import Foog from "../assets/foog.png";
import Lluvia from "../assets/lluvia-muy-fuerte.png";
import Llovizna from "../assets/llovizna.png";
import HumedadIcon from "../assets/gotas.png";
import Nublado from "../assets/parcialmente-nublado.png";

/**
 * Interfaz de la respuesta de Open-Meteo (simplificada para lo que necesitamos).
 */
interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  current_weather: {
    temperature: number;
    windspeed: number;
    winddirection: number;
    weathercode: number;
    time: string; // e.g. "2025-03-14T09:00"
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    relativehumidity_2m: number[];
    precipitation: number[];
    shortwave_radiation: number[];
  };
}

/**
 * Mapeo del weathercode a un resumen y a la imagen importada correspondiente.
 */
function mapWeatherCodeToCustomWeather(code: number) {
  switch (code) {
    case 0:
      return { summary: "Despejado", iconImage: Sol };
    case 1:
    case 2:
    case 3:
      return { summary: "Parcialmente nublado", iconImage: Nublado };
    case 45:
    case 48:
      return { summary: "Niebla", iconImage: Foog };
    case 51:
    case 53:
    case 55:
      return { summary: "Llovizna", iconImage: Llovizna };
    case 61:
    case 63:
    case 65:
      return { summary: "Lluvia", iconImage: Lluvia };
    default:
      return { summary: "Desconocido", iconImage: Sol };
  }
}

/**
 * Interfaces para el estado interno.
 */
interface Viento {
  speed: number;
  angle: number;
  dir: string;
}

interface Precipitacion {
  total: number;
  type: string;
}

interface ClimaActual {
  iconImage: string;        // Imagen del ícono importado
  summary: string;          // Descripción del clima (se usa para alt y texto)
  temperature: number;      // Temperatura en °C
  wind: Viento;
  precipitation: Precipitacion;
  cloud_cover: number;      // No lo provee Open-Meteo en current_weather
  humidity: number;         // Humedad en %
  solarRadiation: number;   // Radiación solar en W/m²
}

/**
 * Componente principal
 */
const Clima: React.FC = () => {
  const [weather, setWeather] = useState<ClimaActual | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Ejemplo: lat/lon de Cancún. Ajusta según tu ubicación.
        const lat = 21.1619;
        const lon = -86.8515;
        // Solicitamos current_weather y datos horarios para humedad, precipitación y radiación solar.
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relativehumidity_2m,precipitation,shortwave_radiation&current_weather=true`;

        const response = await fetch(url);
        if (!response.ok) {
          const errorDetail = await response.text();
          console.error("Error en la respuesta:", errorDetail);
          throw new Error("Error al obtener los datos del clima");
        }

        const data: OpenMeteoResponse = await response.json();

        // Mapeamos el weathercode a un resumen e imagen.
        const { summary, iconImage } = mapWeatherCodeToCustomWeather(
          data.current_weather.weathercode
        );

        // Buscamos el índice de la hora actual en los arrays de hourly.
        const currentTime = data.current_weather.time;
        let index = data.hourly.time.findIndex((t) => t === currentTime);
        if (index === -1) index = 0;

        const humidityNow = data.hourly.relativehumidity_2m[index] ?? 0;
        const solarNow = data.hourly.shortwave_radiation[index] ?? 0;
        const precipitationNow = data.hourly.precipitation[index] ?? 0;

        const clima: ClimaActual = {
          iconImage,
          summary,
          temperature: data.current_weather.temperature,
          wind: {
            speed: data.current_weather.windspeed,
            angle: data.current_weather.winddirection,
            dir: "SSE", // Puedes convertir el ángulo a dirección cardinal si lo deseas
          },
          precipitation: {
            total: precipitationNow,
            type: precipitationNow > 0 ? "rain" : "none",
          },
          cloud_cover: 0, // No disponible en current_weather
          humidity: humidityNow,
          solarRadiation: solarNow,
        };

        setWeather(clima);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchWeather();
  }, []);

  if (error) return <div>Error: {error}</div>;
  if (!weather) return <div>Cargando clima...</div>;

  return (
    <div
      className="weather"
      style={{ display: "flex", alignItems: "center", justifyContent: "left", paddingTop: "2rem",  }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div>
          <strong>Temperatura:</strong> {weather.temperature}°C
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          <img src={HumedadIcon} alt="Humedad" style={{ width: "20px", height: "20px" }} />
          <span>
            <strong>Humedad:</strong> {weather.humidity}%
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          <img src={Sol} alt="Sol" style={{ width: "20px", height: "20px" }} />
          <span>
            <strong>Intensidad solar:</strong> {weather.solarRadiation} W/m²
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
          <strong>Descripción:</strong>
          <img src={weather.iconImage} alt={weather.summary} style={{ width: "60px", height: "60px" }} />
          <span>{weather.summary}</span>
        </div>
      </div>
    </div>
  );
};

export default Clima;
