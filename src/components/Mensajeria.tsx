import React, { useState, useEffect } from "react";

interface Mensaje {
	id: string;
	texto: string;
	remitente: string;
	hora: string;
}

const Mensajeria: React.FC = () => {
	const [mensajes, setMensajes] = useState<Mensaje[]>([]);
	const [mensajeNuevo, setMensajeNuevo] = useState<string>("");

	useEffect(() => {
		const generarMensaje = setInterval(() => {
			const hora = new Date().toLocaleTimeString();
			const nuevoMensaje: Mensaje = {
				id: crypto.randomUUID(),
				texto: `Mensaje automático recibido a las ${hora}`,
				remitente: "Anonymous",
				hora: hora,
			};

			setMensajes((mensajitos) => [...mensajitos, nuevoMensaje]);
		}, 5000);

		return () => clearInterval(generarMensaje); // 🔹 Limpiar el intervalo al desmontar
	}, []);

	const enviarMensaje = (event: React.FormEvent) => {
		event.preventDefault();
		if (mensajeNuevo.trim()) {
			const hora = new Date().toLocaleTimeString();
			const nuevoMensaje: Mensaje = {
				id: crypto.randomUUID(),
				texto: mensajeNuevo, // 🔹 Aquí se usa el input en lugar de la hora
				remitente: "Tú",
				hora: hora,
			};

			setMensajes((mensajitos) => [...mensajitos, nuevoMensaje]);
			setMensajeNuevo("");
		}
	};

	return (
		<>
			<h1>Mensajería</h1>
			<ul>
				{mensajes.map((mensaje) => (
					<li key={mensaje.id}>
						<strong>{mensaje.remitente}:</strong> {mensaje.texto}{" "}
						<em>({mensaje.hora})</em>
					</li>
				))}
			</ul>
			<h2>Enviar mensaje</h2>
			<form onSubmit={enviarMensaje}>
				<input
					type="text"
					value={mensajeNuevo}
					onChange={(e) => setMensajeNuevo(e.target.value)}
					placeholder="Escribe algo"
					aria-label="Escribir mensaje"
				/>
				<button type="submit">Enviar</button>
			</form>
		</>
	);
};

export default Mensajeria;
