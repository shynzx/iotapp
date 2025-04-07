"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import "../../src/styles/zonas.css";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Zona {
  id: number;
  estado: string;
  estado_zona: boolean;
}

export const ZonasPorEstadoPieChart: React.FC = () => {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchZonas = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("http://localhost:3001/zonas");
        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }
        const data = await res.json();

        // Validar y filtrar por estado_zona
        const zonasFiltradas = Array.isArray(data)
          ? data.filter((z: Zona) => z.estado_zona === true)
          : [];

        setZonas(zonasFiltradas);
        setError(null);
      } catch (err) {
        console.error("Error al obtener zonas:", err);
        setError("No se pudieron cargar los datos. Intente nuevamente más tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchZonas();
  }, []);

  // Contamos la cantidad por estado
  const conteo: Record<string, number> = {};
  zonas.forEach((z) => {
    conteo[z.estado] = (conteo[z.estado] || 0) + 1;
  });

  const estados = Object.keys(conteo);
  const cantidades = Object.values(conteo);

  const colores = estados.map((estado) => {
    switch (estado) {
      case "encendido":
        return "rgba(46, 204, 113, 0.8)";
      case "apagado":
        return "rgba(241, 196, 15, 0.8)";
      case "mantenimiento":
        return "rgba(230, 126, 34, 0.8)";
      case "descompuesto":
        return "rgba(231, 76, 60, 0.8)";
      case "fuera_de_servicio":
        return "rgba(142, 68, 173, 0.8)";
      default:
        return "rgba(149, 165, 166, 0.8)";
    }
  });

  const data = {
    labels: estados.map(formatEstadoLabel),
    datasets: [
      {
        label: "Zonas por estado",
        data: cantidades,
        backgroundColor: colores,
        borderColor: colores.map((c) => c.replace("0.8", "1")),
        borderWidth: 1,
        hoverOffset: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        padding: 12,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: (context: any) => {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 2000,
    },
  };

  function formatEstadoLabel(estado: string): string {
    const mapping: Record<string, string> = {
      encendido: "Encendido",
      apagado: "Apagado",
      mantenimiento: "En Mantenimiento",
      descompuesto: "Descompuesto",
      fuera_de_servicio: "Fuera de Servicio",
    };
    return mapping[estado] || estado.charAt(0).toUpperCase() + estado.slice(1).replace(/_/g, " ");
  }

  return (
    <div className="zonas-chart-container">
      <div className="zonas-chart-card">
        <h2 className="zonas-chart-title">Distribución de Zonas por Estado</h2>

        {isLoading && (
          <div className="zonas-loading-container">
            <div className="zonas-loading-spinner"></div>
            <p>Cargando datos...</p>
          </div>
        )}

        {error && (
          <div className="zonas-error-container">
            <p className="zonas-error-message">{error}</p>
            <button className="zonas-retry-button" onClick={() => window.location.reload()}>
              Reintentar
            </button>
          </div>
        )}

        {!isLoading && !error && zonas.length > 0 && (
          <div className="zonas-pie-container">
            <Pie data={data} options={options} />
          </div>
        )}

        {!isLoading && !error && zonas.length === 0 && (
          <p className="zonas-no-data-message">No hay datos disponibles</p>
        )}

        <div className="zonas-chart-footer">
          <p>Total de zonas activas: {zonas.length}</p>
        </div>
      </div>
    </div>
  );
};
