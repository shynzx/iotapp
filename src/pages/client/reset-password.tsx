import React, { useState } from "react";
import { supabase } from "../../supabaseClient";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      Swal.fire({
        text: "Las contraseñas no coinciden.",
        icon: "error",
        confirmButtonText: "Cerrar",
      });
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      Swal.fire({
        text: "Error al restablecer la contraseña: " + error.message,
        icon: "error",
        confirmButtonText: "Cerrar",
      });
    } else {
      Swal.fire({
        text: "Contraseña restablecida con éxito.",
        icon: "success",
        confirmButtonText: "Cerrar",
      }).then(() => {
        navigate("/");
      });
    }
  };

  const togglePasswordVisibility = (field: "password" | "confirmPassword") => {
    if (field === "password") {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  return (
    <div className="login-container reset-password-container">
      <div className="login-box">
        <h1>Restablecer Contraseña</h1>
        <form onSubmit={handleResetPassword}>
          <label htmlFor="password">Nueva Contraseña</label>
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => togglePasswordVisibility("password")}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <label htmlFor="confirmPassword">Confirmar Contraseña</label>
          <div className="password-container">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => togglePasswordVisibility("confirmPassword")}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button type="submit" className="submit-btn">
            Restablecer Contraseña
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;