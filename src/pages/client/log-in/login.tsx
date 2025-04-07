"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import Swal from "sweetalert2";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Discord from "../../../assets/discord.png";

function Login() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [inputError, setInputError] = useState({ email: false, password: false });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Validar redirección OAuth
  useEffect(() => {
    const checkOAuthRedirect = async () => {
      const url = window.location.href;
      const hasOAuthTokens = url.includes("access_token") || url.includes("refresh_token");

      if (!hasOAuthTokens) return;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        localStorage.setItem("access_token", session.access_token);
        localStorage.setItem("refresh_token", session.refresh_token);
        localStorage.setItem("correo_usuario", session.user.email || "");

        // Obtener el rol del usuario desde la tabla correcta
        const { data: userRole, error: roleError } = await supabase
          .from("usuarios_roles") // Cambiado a la tabla correcta
          .select("rol")
          .eq("email", session.user.email)
          .single();

        if (roleError) {
          console.error("Error al obtener el rol del usuario:", roleError.message);
        } else {
          console.log("Rol del usuario (Discord):", userRole?.rol || "No definido");
        }

        navigate("/dashboard");
      }
    };

    checkOAuthRedirect();
  }, [navigate]);

  // Mostrar mensaje de éxito al iniciar sesión
  useEffect(() => {
    if (success) {
      Swal.fire({
        title: "Hola de nuevo",
        html: "Iniciando sesión...",
        timer: 1000,
        timerProgressBar: true,
        didOpen: () => Swal.showLoading(),
      }).then(() => navigate("/dashboard"));
    }
  }, [success, navigate]);

  // Validar formato de correo electrónico
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Manejar envío del formulario de inicio de sesión
  const handleSubmit = async (e: { preventDefault: () => void; currentTarget: any }) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = form.elements.email.value.trim();
    const password = form.elements.password.value.trim();

    setInputError({
      email: !email || !validateEmail(email),
      password: !password,
    });

    if (!email || !password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (!validateEmail(email) || email.length > 40 || password.length > 40) {
      setError("Verifica los campos del formulario.");
      return;
    }

    const { data, error: supabaseError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (supabaseError || !data.user) {
      setError("Correo o contraseña incorrecta");
      return;
    }

    localStorage.setItem("access_token", data.session.access_token);
    localStorage.setItem("refresh_token", data.session.refresh_token);
    localStorage.setItem("correo_usuario", email);

    // Obtener el rol del usuario desde la tabla correcta
    const { data: userRole, error: roleError } = await supabase
      .from("usuarios_roles") // Cambiado a la tabla correcta
      .select("rol")
      .eq("email", email)
      .single();

    if (roleError) {
      console.error("Error al obtener el rol del usuario:", roleError.message);
    } else {
      console.log("Rol del usuario (Inicio normal):", userRole?.rol || "No definido");
    }

    setSuccess(true);
    setError("");

    setTimeout(() => {
      navigate("/dashboard");
    }, 2000);
  };

  // Manejar recuperación de contraseña
  const handleForgotPassword = async () => {
    const { value: email } = await Swal.fire({
      title: "Recuperar contraseña",
      input: "email",
      inputLabel: "Introduce tu correo electrónico",
      inputPlaceholder: "Correo electrónico",
      showCancelButton: true,
      confirmButtonText: "Enviar",
      cancelButtonText: "Cancelar",
    });

    if (email) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "http://localhost:3000/reset-password", // Cambia esto por tu URL de redirección
      });

      if (error) {
        Swal.fire({
          text: "Error al enviar el correo de recuperación: " + error.message,
          icon: "error",
          confirmButtonText: "Cerrar",
        });
      } else {
        Swal.fire({
          text: "Correo de recuperación enviado. Revisa tu bandeja de entrada.",
          icon: "success",
          confirmButtonText: "Cerrar",
        });
      }
    }
  };

  // Manejar inicio de sesión con Discord
  const handleDiscordLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: "https://eeryivzgrgkarzwyuvun.supabase.co/auth/v1/callback",
      },
    });

    if (error) {
      Swal.fire({
        text: "Error al redirigir a Discord: " + error.message,
        icon: "error",
        confirmButtonText: "Cerrar",
      });
    }
  };

  // Alternar visibilidad de la contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Iniciar Sesión</h1>

        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="error-message">
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="email">Correo electrónico</label>
          <input
            type="email"
            id="email"
            name="email"
            className={inputError.email ? "input-error" : ""}
            placeholder="Introduce el correo electrónico"
            maxLength={40}
          />

          <label htmlFor="password">Contraseña</label>
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              className={inputError.password ? "input-error" : ""}
              placeholder="Contraseña"
              maxLength={40}
            />
            <button type="button" className="toggle-password" onClick={togglePasswordVisibility}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button type="submit" className="submit-btn">
            Iniciar sesión
          </button>
        </form>

        <p className="register-link">
          ¿No tienes una cuenta? <a href="/registro">Regístrate</a>
        </p>
        <p className="forgot-password-link">
          <button type="button" onClick={handleForgotPassword}>
            ¿Olvidaste tu contraseña?
          </button>
        </p>

        <div className="divider">
          <span>O continuar con</span>
        </div>
        <button type="button" className="submit-btn discord-btn" onClick={handleDiscordLogin}>
          <img src={Discord || "/placeholder.svg"} alt="Discord" className="discord-icon" />
          Iniciar sesión con Discord
        </button>
      </div>
    </div>
  );
}

export default Login;