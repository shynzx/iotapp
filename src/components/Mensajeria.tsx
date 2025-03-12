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
				return [...mensajito.slice(1), nuevoMensaje];
			});
		}, 5000);
	}, []);
	return (
		<>
			<h1>Mensaje</h1>
			{mensajes.map((mensaje) => (
				<p>
					{mensaje.remitente}: {mensaje.texto}
				</p>
			))}
		</>
	);
};

export default Mensajeria;
