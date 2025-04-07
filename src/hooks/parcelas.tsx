import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken =
  process.env.REACT_APP_MAPBOX_TOKEN ||
  "pk.eyJ1IjoiZGllZ29wZWRyYXphIiwiYSI6ImNtODdjdWFiMzAzbHUybXE1NWN1Y2RrMm8ifQ.LFnT2UjHsTYFWgvSYPqVZQ";

const center = { lat: 21.1619, lng: -86.8515 };

interface Parcela {
  id: number;
  nombre: string;
  ubicacion: string;
  responsable: string;
  cultivo: string;
  estado: boolean;
  lat: number | string;
long: number | string;

  temperatura?: number;
  humedad?: number;
  lluvia?: number;
  sol?: number;
  ultimo_riego?: string;
  
}

interface MapComponentProps {
  refreshTrigger: boolean;
}

const API_URL = "http://localhost:3001/parcelas";

export const MapComponent: React.FC<MapComponentProps> = ({ refreshTrigger }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sinParcelasValidas, setSinParcelasValidas] = useState(false);

  const fetchParcelas = async () => {
    try {
      setError(null);
      setSinParcelasValidas(false);
      const response = await fetch(API_URL);
      const contentType = response.headers.get("content-type");

      if (!response.ok || !contentType?.includes("application/json")) {
        throw new Error("Respuesta inválida de la API");
      }

      const data: Parcela[] = await response.json();
      setParcelas(data);
    } catch (err) {
      setError("No se pudo cargar la información de las parcelas. Intenta nuevamente.");
      console.error("Error al obtener parcelas:", err);
    }
  };

  useEffect(() => {
    fetchParcelas();
  }, [refreshTrigger]);

  useEffect(() => {
    if (!mapContainerRef.current) return;
  
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [center.lng, center.lat],
      zoom: 12,
    });
  
    const bounds = new mapboxgl.LngLatBounds();
  
    const parcelasActivas = parcelas.filter(p => {
      const estadoNormalizado =
        typeof p.estado === "string"
          ? (p.estado as string).toLowerCase() === "true"
          : Boolean(p.estado);
      return estadoNormalizado;
    });
  
    console.log("📦 Parcelas activas:", parcelasActivas);
  
    if (parcelasActivas.length === 0) {
      console.warn("⛔ No hay parcelas activas.");
      setSinParcelasValidas(true);
      return () => map.remove();
    }
  
    let hayCoordenadasValidas = false;
  
    parcelasActivas.forEach(parcela => {
      const rawLat = parcela.lat;
      const rawLng = parcela.long;
  
      if (
        rawLat === undefined || rawLng === undefined ||
        rawLat === null || rawLng === null ||
        (typeof rawLat === "string" && rawLat === "") ||
        (typeof rawLng === "string" && rawLng === "")
      ) {
        console.warn(`⚠️ Coordenadas vacías para parcela ID ${parcela.id}`);
        return;
      }
  
      const lat = Number(rawLat);
      const lng = Number(rawLng);
  
      if (
        isNaN(lat) || isNaN(lng) ||
        lat < -90 || lat > 90 ||
        lng < -180 || lng > 180
      ) {
        console.warn(`❌ Coordenadas inválidas para parcela ID ${parcela.id}: lat=${lat}, lng=${lng}`);
        return;
      }
  
      hayCoordenadasValidas = true;
  
      new mapboxgl.Marker({ color: "rgb(255, 0, 0)" })
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup().setHTML(`
            <div>
              <p style="margin: 4px 0; color: #000;"><strong>Nombre:</strong> ${parcela.nombre}</p>
              <p style="margin: 4px 0; color: #000;"><strong>Cultivo:</strong> ${parcela.cultivo}</p>
              <p style="margin: 4px 0; color: #000;"><strong>Responsable:</strong> ${parcela.responsable}</p>
              <p style="margin: 4px 0; color: #000;"><strong>🌡️ Temperatura:</strong> ${parcela.temperatura ?? "N/A"} °C</p>
              <p style="margin: 4px 0; color: #000;"><strong>💧 Humedad:</strong> ${parcela.humedad ?? "N/A"} %</p>
              <p style="margin: 4px 0; color: #000;"><strong>🌧️ Lluvia:</strong> ${parcela.lluvia ?? "N/A"} mm</p>
              <p style="margin: 4px 0; color: #000;"><strong>☀️ Sol:</strong> ${parcela.sol ?? "N/A"} %</p>
              <p style="margin: 4px 0; color: #000;"><strong>⏳ Último Riego:</strong> ${
                parcela.ultimo_riego ? new Date(parcela.ultimo_riego).toLocaleString() : "N/A"
              }</p>
              <p style="margin: 4px 0; color: #000;"><strong>Estado:</strong> Activa ✅</p>
            </div>
          `)
        )
        .addTo(map);
  
      bounds.extend([lng, lat]);
    });
  
    if (hayCoordenadasValidas) {
      map.fitBounds(bounds, { padding: 50 });
      setSinParcelasValidas(false); // 🔄 aseguramos que se quite si antes estaba true
    } else {
      console.warn("⚠️ Parcelas activas, pero sin coordenadas válidas.");
      setSinParcelasValidas(true);
    }
  
    return () => map.remove();
  }, [parcelas]);
  
  

  return (
    <div style={{ position: "relative", width: "70%", height: "500px", borderRadius: "10px", overflow: "hidden" }}>
      <div
        ref={mapContainerRef}
        style={{ width: "100%", height: "100%", borderRadius: "10px" }}
      />
      {parcelas.length === 0 && (
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          background: "rgb(33, 29, 29)",
          padding: "20px",
          borderRadius: "10px",
          textAlign: "center"
        }}>
          <p style={{ fontWeight: "bold" }}>No hay parcelas registradas aún</p>
          <button onClick={fetchParcelas} style={{ padding: "10px", marginTop: "10px" }}>
            Recargar
          </button>
        </div>
      )}
      {sinParcelasValidas && (
        <div style={{
          position: "absolute",
          top: "10px", left: "50%",
          transform: "translateX(-50%)",
         
          color: "#fff",
          padding: "10px 20px",
          borderRadius: "10px",
          fontWeight: "bold"
        }}>
        
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
          <button onClick={fetchParcelas} style={{
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
