import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { Send, Trash2 } from "lucide-react";
import "./../../styles/chatAgricolaStyle.css";

interface Mensaje {
  tipo: "usuario" | "asistente";
  texto: string;
}

export default function ChatAgricola() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [entrada, setEntrada] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  // Cargar mensajes desde localStorage al iniciar
  useEffect(() => {
    const mensajesGuardados = localStorage.getItem("mensajes_chat_agricola");
    if (mensajesGuardados) {
      setMensajes(JSON.parse(mensajesGuardados));
    }
  }, []);

  // Guardar mensajes en localStorage cada vez que cambian
  useEffect(() => {
    localStorage.setItem("mensajes_chat_agricola", JSON.stringify(mensajes));
  }, [mensajes]);

  const enviarMensaje = async () => {
    if (!entrada.trim()) return;

    const nuevoMensaje: Mensaje = { tipo: "usuario", texto: entrada };
    setMensajes((prev) => [...prev, nuevoMensaje]);
    setEntrada(""); // Limpiar input inmediatamente
    inputRef.current?.focus(); // Opcional: devolver foco al input
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:3002/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pregunta: entrada }),
      });

      const data = await res.json();
      setMensajes((prev) => [...prev, { tipo: "asistente", texto: data.respuesta }]);
    } catch {
      setMensajes((prev) => [
        ...prev,
        { tipo: "asistente", texto: "⚠️ Error al contactar al servidor." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const borrarMensajes = () => {
    setMensajes([]);
    localStorage.removeItem("mensajes_chat_agricola");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    navigate("/");
  };

  const sugerencias = [
    "¿Cuántas parcelas hay registradas?",
    "¿Cuántas parcelas activas hay?",
    "¿Existe una parcela llamada x?",
    "Dame un resumen global de sensores",
  ];
  
  const enviarSugerencia = (texto: string) => {
    setEntrada(texto);
    setTimeout(() => enviarMensaje(), 100); // Llamamos a enviarMensaje con un delay mínimo para esperar que setEntrada se aplique
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

      <main className="hola">
        <div className="chat-container">
          <div className="chat-header">
            <h2>💬 Asistente Virtual</h2>
            <p className="chat-subtitle">Consulta información sobre las parcelas</p>
            <div className="chat-header-actions">
              <div className="botonborrar">
                <button onClick={borrarMensajes} className="btn-borrar">
                  <Trash2 size={16} /> Borrar chat
                </button>
              </div>
            </div>
          </div>

          <div className="chat-box">
            {mensajes.length === 0 ? (
              <div className="chat-empty-state">
                <div className="chat-empty-icon">🌱</div>
                <h3>¡Bienvenido al Asistente Virtual!</h3>
                <p>Puedes preguntar sobre las parcelas, cuantas hay, sobre los sensores globales o sobre otro tema.</p>
                <div className="chat-suggestions">
  {sugerencias.map((sugerencia, index) => (
    <button key={index} onClick={() => enviarSugerencia(sugerencia)}>
      {sugerencia}
    </button>
  ))}
</div>

              </div>
            ) : (
              mensajes.map((msg, idx) => (
                <div key={idx} className={`mensaje ${msg.tipo}`}>
                  <div className="mensaje-contenido">{msg.texto}</div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="mensaje asistente">
                <div className="mensaje-contenido typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
          </div>

          <div className="input-container">
            <input
              ref={inputRef}
              type="text"
              placeholder="Escribe tu consulta agrícola..."
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && enviarMensaje()}
            />
            <button onClick={enviarMensaje} disabled={isLoading || !entrada.trim()}>
              <Send size={18} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
