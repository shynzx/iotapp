import UsuarioIcon from "../../assets/usuario.svg";

export default function Navbar() {
	return (
		<nav className="navbar">
			<div className="navbar-container">
				<h1 className="navbar-title">Navbar</h1>
				<ul className="navbar-menu">
					<li className="navbar-item">Home</li>
					<li className="navbar-item">Roger</li>
					<li className="navbar-item">Services</li>
					<li className="navbar-item">Doc</li>
					{/* Se usa el SVG como fuente de imagen */}
					<img src={UsuarioIcon} alt="Icono de usuario" className="navbar-icon" />
				</ul>
			</div>
		</nav>
	);
}
