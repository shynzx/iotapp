import React, { useState, useEffect } from "react";

interface Mensaje {
	id: number;
	texto: string;
	remitente: string;
	hora: string;
}

const Mensajeria: React.FC = () => {
	const [mensajes, setMensajes] = useState<Mensaje[]>([]);
	const [mensajeNuevo, setMensajeNuevo] = useState<string>("");
	useEffect(() => {
		const generarMensaje = setInterval(() => {
			const hora = new Date().toLocaleString();
			const nuevoMensaje: Mensaje = {
				id: Date.now(),
				texto: `Nuevo mensaje ${hora}`,
				remitente: "Anonymous",
				hora: hora,
			};

			setMensajes((mensajito) => {
				return [...mensajito, nuevoMensaje];
			});
		}, 5000);
	}, []);

	const enviarMensaje = (event: React.FormEvent) => {
		event.preventDefault();
		if (mensajeNuevo.trim()) {
			const hora = new Date().toLocaleString();
			const nuevoMensaje: Mensaje = {
				id: Date.now(),
				texto: `Nuevo mensaje ${hora}`,
				remitente: "Anonymous",
				hora: hora,
			};

			setMensajes((mensajito) => {
				return [...mensajito, nuevoMensaje];
			});
			setMensajeNuevo("");
		}
	};

	return (
		<>
			<h1>Mensaje</h1>
			{mensajes.map((mensaje) => (
				<p>
					{mensaje.remitente}: {mensaje.texto}
				</p>
			))}
			<h2>Enviar mensaje</h2>
			<form onSubmit={enviarMensaje}>
				<input
					type="text"
					value={mensajeNuevo}
					onChange={(e) => setMensajeNuevo(e.target.value)} // Corrección aquí
					placeholder="Escribe algo"
				/>
				<button type="submit">Enviar</button>
			</form>
		</>
	);
};

export default Mensajeria;
