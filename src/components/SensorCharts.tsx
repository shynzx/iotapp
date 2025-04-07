"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { Line, Bar, Radar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
)

const HISTORIAL_URL = "http://localhost:3001/historial-sensores-globales"
const PARCELAS_URL = "http://localhost:3001/parcelas"
const PARCELA_DETALLE_URL = "http://localhost:3001/historial-sensores-parcela"

interface GlobalSensorData {
  temperatura: number
  humedad: number
  lluvia: number
  sol: number
  fecha: string
}

interface ParcelaSensorData {
  id: number
  nombre: string
  temperatura: number
  humedad: number
  lluvia: number
  sol: number
}

interface ParcelaHistorialData {
  parcela_id: number
  nombre_parcela: string
  temperatura: number
  humedad: number
  lluvia: number
  sol: number
  fecha: string
}

export const SensorCharts: React.FC = () => {
  const [historial, setHistorial] = useState<GlobalSensorData[]>([])
  const [parcelas, setParcelas] = useState<ParcelaSensorData[]>([])
  const [activeChart, setActiveChart] = useState<"temperatura" | "humedadLluvia" | "radar">(
    () => (localStorage.getItem("activeChart") as "temperatura" | "humedadLluvia" | "radar") || "temperatura"
  )
  const [isLoading, setIsLoading] = useState(true)
  
  const [selectedParcela, setSelectedParcela] = useState<string | "global">(
    () => localStorage.getItem("selectedParcela") || "global"
  )
  const [parcelaHistorial, setParcelaHistorial] = useState<ParcelaHistorialData[]>([])
  const [error, setError] = useState<string | null>(null)

  const fetchParcelaHistorial = useCallback(async (nombre: string) => {
    if (nombre === "global") {
      setParcelaHistorial([])
      return
    }

    try {
      const res = await fetch(`${PARCELA_DETALLE_URL}/${encodeURIComponent(nombre)}`)
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`)
      }
      const data: ParcelaHistorialData[] = await res.json()
      const sorted = data.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      setParcelaHistorial(sorted.slice(-11))
      setError(null)
    } catch (err) {
      console.error(`Error al obtener historial de parcela ${nombre}:`, err)
      setError(`No se pudo cargar datos para ${nombre}`)
      setParcelaHistorial([])
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("activeChart", activeChart)
  }, [activeChart])
  
  useEffect(() => {
    localStorage.setItem("selectedParcela", selectedParcela)
  }, [selectedParcela])
  

useEffect(() => {
  const fetchHistorial = async () => {
    try {
      const res = await fetch(HISTORIAL_URL)
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data: GlobalSensorData[] = await res.json()
      const sorted = data.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      setHistorial(sorted.slice(-11)) // ✅ ACTUALIZA APENAS LLEGA
    } catch (err) {
      console.error("Error al obtener historial global:", err)
      setError("Error al cargar datos globales")
    }
  }

  const fetchParcelas = async () => {
    try {
      const res = await fetch(PARCELAS_URL)
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data: ParcelaSensorData[] = await res.json()
      setParcelas(data)

      // Si la parcela seleccionada ya no existe, vuelve a global
      if (selectedParcela !== "global" && !data.some(p => p.nombre === selectedParcela)) {
        setSelectedParcela("global")
      }
    } catch (err) {
      console.error("Error al obtener parcelas activas:", err)
      setError("Error al cargar lista de parcelas")
    }
  }

  const loadData = async () => {
    setIsLoading(true)
    try {
      await fetchHistorial()
      await fetchParcelas()
      if (selectedParcela !== "global") {
        await fetchParcelaHistorial(selectedParcela)
      }
    } finally {
      setIsLoading(false)
    }
  }

  loadData() // ⚡ Carga inmediata

  const interval = setInterval(() => {
    fetchHistorial() // ⚡ Actualiza directo
    fetchParcelas()
    if (selectedParcela !== "global") {
      fetchParcelaHistorial(selectedParcela)
    }
  }, 30000)

  return () => clearInterval(interval)
}, [fetchParcelaHistorial, selectedParcela])

  
  useEffect(() => {
    if (selectedParcela !== "global") {
      fetchParcelaHistorial(selectedParcela)
    } else {
      setParcelaHistorial([])
    }
  }, [selectedParcela, fetchParcelaHistorial])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return isNaN(date.getTime()) ? '--:--' : `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`
    } catch {
      return '--:--'
    }
  }

  

  const dataTemperatura = {
    labels: selectedParcela === "global" ? 
      historial.map(d => formatDate(d.fecha)) : 
      parcelaHistorial.map(d => formatDate(d.fecha)),
    datasets: [
      {
        label: `Temperatura (°C) ${selectedParcela !== "global" ? `- ${selectedParcela}` : "Global"}`,
        data: selectedParcela === "global" ? 
          historial.map(d => d.temperatura) : 
          parcelaHistorial.map(d => d.temperatura),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.3)",
        borderWidth: 2,
        pointRadius: 4,
        tension: 0.4,
        fill: true,
        yAxisID: "y"
      },
      {
        label: `Intensidad Solar% ${selectedParcela !== "global" ? `- ${selectedParcela}` : "Global"}`,
        data: selectedParcela === "global" ? 
          historial.map(d => d.sol) : 
          parcelaHistorial.map(d => d.sol),
        borderColor: "rgba(255, 206, 86, 1)",
        backgroundColor: "rgba(255, 206, 86, 0.3)",
        borderWidth: 2,
        pointRadius: 4,
        tension: 0.4,
        fill: true,
        yAxisID: "y1"
      },
    ]
  }

  const dataHumedadLluvia = {
    labels: selectedParcela === "global" ? 
      historial.map(d => formatDate(d.fecha)) : 
      parcelaHistorial.map(d => formatDate(d.fecha)),
    datasets: [
      {
        label: `Humedad (%) ${selectedParcela !== "global" ? `- ${selectedParcela}` : "Global"}`,
        data: selectedParcela === "global" ? 
          historial.map(d => d.humedad) : 
          parcelaHistorial.map(d => d.humedad),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
        borderRadius: 5,
      },
      {
        label: `Lluvia (mm) ${selectedParcela !== "global" ? `- ${selectedParcela}` : "Global"}`,
        data: selectedParcela === "global" ? 
          historial.map(d => d.lluvia) : 
          parcelaHistorial.map(d => d.lluvia),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        borderRadius: 5,
      },
    ],
  }

  const dataRadar = {
    labels: ["Temperatura", "Humedad", "Lluvia", "Sol"],
    datasets: parcelas.map((p, i) => {
      const hue = (i * 360 / parcelas.length) % 360
      return {
        label: p.nombre,
        data: [p.temperatura, p.humedad, p.lluvia, p.sol],
        backgroundColor: `hsla(${hue}, 80%, 60%, 0.3)`,
        borderColor: `hsla(${hue}, 80%, 60%, 1)`,
        borderWidth: 2,
        pointBackgroundColor: `hsla(${hue}, 80%, 60%, 1)`,
      }
    }),
  }

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "white",
          font: { size: 14, weight: "bold" as const },
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: { size: 14, weight: "bold" as const },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 8,
      },
    },
  }

  const lineOptions = {
    ...commonOptions,
    scales: {
      x: {
        title: { display: true, text: "Hora de registro", color: "white" },
        ticks: { color: "white" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
      y: {
        title: { display: true, text: "Temperatura (°C)", color: "white" },
        ticks: { color: "white" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
      y1: {
        position: "right" as const,
        title: { display: true, text: "Intensidad Solar%", color: "white" },
        ticks: { color: "white" },
        grid: { drawOnChartArea: false },
      },
    },
  }

  const barOptions = {
    ...commonOptions,
    scales: {
      x: {
        title: { display: true, text: "Hora de registro", color: "white" },
        ticks: { color: "white" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
      y: {
        title: { display: true, text: "Humedad (%) / Lluvia (mm)", color: "white" },
        ticks: { color: "white" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
    },
  }

  const radarOptions = {
    ...commonOptions,
    scales: {
      r: {
        angleLines: { color: "rgba(255, 255, 255, 0.2)" },
        grid: { color: "rgba(255, 255, 255, 0.2)" },
        pointLabels: {
          color: "white",
          font: { size: 14, weight: "bold" as const },
        },
        ticks: {
          backdropColor: "transparent",
          color: "rgba(255, 255, 255, 0.7)",
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeOutCirc" as const,
    },
  }

  const renderActiveChart = () => {
    if (
      (selectedParcela === "global" && historial.length === 0) ||
      (selectedParcela !== "global" && parcelaHistorial.length === 0)
    ) return <p>Cargando datos...</p>
    

    switch (activeChart) {
      case "temperatura":
        return (
          <div className="chart-container">
            <h2 className="chart-title">
              Temperatura e Intensidad Solar {selectedParcela !== "global" ? `- Parcela ${selectedParcela}` : "Global"}
            </h2>
            <div className="chart-wrapper">
              {dataTemperatura.datasets[0].data.length > 0 ? (
                <Line data={dataTemperatura} options={lineOptions} />
              ) : (
                <p>No hay datos disponibles</p>
              )}
            </div>
          </div>
        )
      case "humedadLluvia":
        return (
          <div className="chart-container">
            <h2 className="chart-title">
              Humedad y Lluvia {selectedParcela !== "global" ? `- Parcela ${selectedParcela}` : "Global"}
            </h2>
            <div className="chart-wrapper">
              {dataHumedadLluvia.datasets[0].data.length > 0 ? (
                <Bar data={dataHumedadLluvia} options={barOptions} />
              ) : (
                <p>No hay datos disponibles</p>
              )}
            </div>
          </div>
        )
      case "radar":
        return (
          <div className="chart-container radar-chart-container">
            <h2 className="chart-title">Comparativa entre Parcelas Activas</h2>
            <div className="chart-wrapper radar-chart">
              {parcelas.length > 0 ? (
                <Radar data={dataRadar} options={radarOptions} />
              ) : (
                <p>No hay parcelas activas</p>
              )}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="sensor-charts">
      <h2 className="charts-title">Gráficas de Sensores</h2>
      <div className="chart-selector">
        <button
          className={`chart-button ${activeChart === "temperatura" ? "active" : ""}`}
          onClick={() => setActiveChart("temperatura")}
        >
          Temperatura / Sol
        </button>
        <button
          className={`chart-button ${activeChart === "humedadLluvia" ? "active" : ""}`}
          onClick={() => setActiveChart("humedadLluvia")}
        >
          Humedad y Lluvia
        </button>
        <button
          className={`chart-button ${activeChart === "radar" ? "active" : ""}`}
          onClick={() => setActiveChart("radar")}
        >
          Radar
        </button>
      </div>

      {activeChart !== "radar" && (
  <div className="parcel-selector">
    <label htmlFor="parcela-select">Seleccionar Parcela: </label>
    <select
      id="parcela-select"
      value={selectedParcela}
      onChange={(e) => setSelectedParcela(e.target.value)}
      disabled={isLoading}
    >
      <option value="global">Datos Globales</option>
      {parcelas.map((parcela) => (
        <option key={parcela.id} value={parcela.nombre}>
          {parcela.nombre}
        </option>
      ))}
    </select>
  
  </div>
)}

 
      {renderActiveChart()}
      <div>ultimos 11 registros guardados</div>
      <div className="chart-info">
        {selectedParcela !== "global" && parcelaHistorial[0]?.nombre_parcela && (
          <p>Parcela: {parcelaHistorial[0].nombre_parcela}</p>
        )}
      </div>
    </div>
  )
}
