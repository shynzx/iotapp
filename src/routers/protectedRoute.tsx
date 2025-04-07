import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { JSX } from "react/jsx-runtime";
import Swal from "sweetalert2";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [alertShown, setAlertShown] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(Boolean(data.session));
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(Boolean(session));
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated === false && !alertShown) {
      setAlertShown(true);

      Swal.fire({
        icon: "error",
        title: "Acceso denegado",
        html: `
          <p>No tienes permiso para acceder a esta ruta.</p>
          <p>Serás redirigido a la página principal en <b>5</b> segundos.</p>
        `,
        confirmButtonText: "Entendido",
        timer: 5000,
        timerProgressBar: true,
      }).then((result) => {
        if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
          window.location.href = "/";
        }
      });

      // Redirigir automáticamente después de 5 segundos
      const timer = setTimeout(() => {
        window.location.href = "/";
      }, 5000);

      return () => clearTimeout(timer); // Limpiar el temporizador al desmontar
    }
  }, [isAuthenticated, alertShown]);

  if (isAuthenticated === null) {
    return <div>🦖 ¡Cargando la seguridad de tu app como velociraptor hambriento!</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
};

export default ProtectedRoute;