import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken =
  process.env.REACT_APP_MAPBOX_TOKEN ||
  "pk.eyJ1IjoiZGllZ29wZWRyYXphIiwiYSI6ImNtODdjdWFiMzAzbHUybXE1NWN1Y2RrMm8ifQ.LFnT2UjHsTYFWgvSYPqVZQ";

const center = { lat: 21.1619, lng: -86.8515 };

interface Zona {
  id: number;
  sector: string;
  nombre: string;
  tipo_riego: string;
  estado: string;
  estado_zona: boolean;
  latitud: number | null;
  longitud: number | null;
  motivo?: string | null;
  fecha: string | null;
  color: string;
}

interface MapComponentProps {
  refreshTrigger: boolean;
}

const API_URL = "http://localhost:3001/zonas";

export const MapComponent: React.FC<MapComponentProps> = ({ refreshTrigger }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sinZonasValidas, setSinZonasValidas] = useState(false);

  const fetchZonas = async () => {
    try {
      setError(null);
      setSinZonasValidas(false);
      const response = await fetch(API_URL);
      const contentType = response.headers.get("content-type");

      if (!response.ok || !contentType?.includes("application/json")) {
        throw new Error("Respuesta inválida de la API");
      }

      const data: Zona[] = await response.json();
      setZonas(data);
    } catch (err) {
      setError("No se pudo cargar la información de las zonas. Intenta nuevamente.");
      console.error("Error al obtener zonas:", err);
    }
  };

  useEffect(() => {
    fetchZonas();
  }, [refreshTrigger]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [center.lng, center.lat],
      zoom: 13,
    });

    mapRef.current = map;

    const bounds = new mapboxgl.LngLatBounds();

    const zonasValidas = zonas.filter(z =>
      z.latitud !== null &&
      z.longitud !== null &&
      z.estado_zona === true
    );

    if (zonasValidas.length === 0) {
      console.warn("⛔ No hay zonas con coordenadas válidas y estado_zona=true.");
      setSinZonasValidas(true);
      return () => map.remove();
    }

    zonasValidas.forEach(zona => {
      const lat = Number(zona.latitud);
      const lng = Number(zona.longitud);

      if (
        isNaN(lat) || isNaN(lng) ||
        lat < -90 || lat > 90 ||
        lng < -180 || lng > 180
      ) {
        console.warn(`❌ Coordenadas inválidas para zona ID ${zona.id}: lat=${lat}, lng=${lng}`);
        return;
      }

      new mapboxgl.Marker({ color: zona.color || "#000000" })
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup().setHTML(`
            <div style="color: black;">
              <p><strong>Nombre:</strong> ${zona.nombre}</p>
              <p><strong>Sector:</strong> ${zona.sector}</p>
              <p><strong>Tipo de Riego:</strong> ${zona.tipo_riego}</p>
              <p><strong>Estado:</strong> ${zona.estado}</p>
              <p><strong>Fecha:</strong> ${
                zona.fecha ? new Date(zona.fecha).toLocaleString() : "Fecha indefinida"
              }</p>
              ${zona.motivo ? `<p><strong>Motivo:</strong> ${zona.motivo}</p>` : ""}
            </div>
          `)
        )
        .addTo(map);

      bounds.extend([lng, lat]);
    });

    map.fitBounds(bounds, { padding: 50 });

    return () => map.remove();
  }, [zonas]);

  const handleZoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut();
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "500px", borderRadius: "10px", overflow: "hidden" }}>
      <div
        ref={mapContainerRef}
        style={{ width: "100%", height: "100%", borderRadius: "10px" }}
      />

      {/* Botones de zoom */}
      <div style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        zIndex: 1
      }}>
        <button
          onClick={handleZoomIn}
          style={{
            padding: "10px",
            borderRadius: "50%",
            background: "#2ecc71",
            color: "white",
            fontWeight: "bold",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
          }}
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          style={{
            padding: "10px",
            borderRadius: "50%",
            background: "#e74c3c",
            color: "white",
            fontWeight: "bold",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
          }}
        >
          -
        </button>
      </div>

      {/* Estado y errores */}
      {zonas.length === 0 && (
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          background: "#222",
          color: "#fff",
          padding: "20px",
          borderRadius: "10px",
          textAlign: "center"
        }}>
          <p style={{ fontWeight: "bold" }}>No hay zonas registradas aún</p>
          <button onClick={fetchZonas} style={{ padding: "10px", marginTop: "10px" }}>
            Recargar
          </button>
        </div>
      )}
      {sinZonasValidas && (
        <div style={{
          position: "absolute",
          top: "10px", left: "50%",
          transform: "translateX(-50%)",
          background: "#333",
          color: "#fff",
          padding: "10px 20px",
          borderRadius: "10px",
          fontWeight: "bold"
        }}>
          Zonas sin coordenadas válidas.
        </div>
      )}
      {error && (
        <div style={{
          position: "absolute",
          top: "10px", left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(255, 0, 0, 0.8)",
          color: "#fff",
          padding: "10px 20px",
          borderRadius: "10px",
          fontWeight: "bold"
        }}>
          {error}
          <br />
          <button onClick={fetchZonas} style={{
            marginTop: "10px",
            padding: "6px 12px",
            backgroundColor: "#fff",
            color: "#f00",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}>
            Reintentar
          </button>
        </div>
      )}
    </div>
  );
};
