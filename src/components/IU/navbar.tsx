import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import UsuarioIcon from "../../assets/usuario (2).png";
import planta from "../../assets/planta.png";
import { User } from "@supabase/supabase-js";
import { Menu } from 'lucide-react';
import Swal from "sweetalert2"; // 🔥 Importamos SweetAlert2

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [userImg, setUserImg] = useState(UsuarioIcon);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session && session.user) {
        setUser(session.user);
        const avatarUrl = session.user.user_metadata?.avatar_url;
        setUserImg(avatarUrl || UsuarioIcon);
      }
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session && session.user) {
          setUser(session.user);
          const avatarUrl = session.user.user_metadata?.avatar_url;
          setUserImg(avatarUrl || UsuarioIcon);
        } else {
          setUser(null);
          setUserImg(UsuarioIcon);
        }
      }
    );

    return () => {
      if (listener && listener.subscription) {
        listener.subscription.unsubscribe();
      }
    };
  }, []);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "¿Cerrar sesión?",
      text: "Tu sesión será cerrada y serás redirigido.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      await supabase.auth.signOut();
      setUser(null);
      setUserImg(UsuarioIcon);
      setMenuOpen(false);
      setMobileMenuOpen(false);

      await Swal.fire({
        icon: "success",
        title: "Sesión cerrada exitosamente",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });

      window.location.href = "/";
    }
  };

  const getDisplayName = (): string => {
    if (!user) return "Usuario";
    return (
      user.user_metadata?.display_name ||
      user.user_metadata?.name ||
      user.user_metadata?.full_name ||
      "Usuario"
    );
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo-container">
          <img src={planta || "/placeholder.svg"} alt="Logo de la empresa" className="navbar-logo" />
          <div className="navbar-line"></div>
          <h1 className="navbar-title">IotApp</h1>
        </div>

        <button 
          className="mobile-menu-button" 
          onClick={toggleMobileMenu}
          aria-label="Menú móvil"
        >
          <Menu size={24} color="#fff" />
        </button>

        <ul className={`navbar-menu ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
          {user ? (
            <div className="navbar-profile">
              <img
                src={userImg || "/placeholder.svg"}
                alt="Usuario"
                className="icono-usuario"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  cursor: "pointer",
                }}
                onClick={() => setMenuOpen(!menuOpen)}
              />
              <span
                className="navbar-item"
                onClick={() => setMenuOpen(!menuOpen)}
                style={{ cursor: "pointer" }}
              >
                {getDisplayName()}{" "}
              </span>

              {menuOpen && (
                <div className="profile-menu">
                  <button className="vertical-text" onClick={handleLogout}>
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <li className="navbar-item login-button">
                <button onClick={() => (window.location.href = "/")}>
                  Iniciar sesión
                </button>
              </li>
              <li className="navbar-item register-button">
                <button onClick={() => (window.location.href = "/registro")}>
                  Registrarse
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
