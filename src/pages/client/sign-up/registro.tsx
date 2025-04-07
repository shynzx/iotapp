"use client"

import { useState, type FormEvent, type JSX } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { supabase } from "../../../supabaseClient"
import Swal from "sweetalert2"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import Discord from "../../../assets/discord.png"

interface InputError {
  name: boolean
  email: boolean
  password: boolean
  confirmPassword: boolean
}

const EyeIcon = (): JSX.Element => <FaEye />
const EyeSlashIcon = (): JSX.Element => <FaEyeSlash />

function Register(): JSX.Element {
  const [error, setError] = useState<string>("")
  const [inputError, setInputError] = useState<InputError>({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  })
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const navigate = useNavigate()

  const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const validatePassword = (password: string): boolean => /^(?=.*[A-Z])(?=.*[!@#$%^&:*])(?=.{6,})/.test(password)

  // Función para verificar si el correo ya existe consultando directamente la tabla auth.users
  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      // Consulta a la tabla auth.users para verificar si el correo existe
      const { data, error } = await supabase.from("usuarios_roles").select("email").eq("email", email).maybeSingle()

      if (error) {
        console.error("Error al consultar la tabla auth.users:", error)
        // Si hay un error en la consulta, procedemos con el registro
        return false
      }

      // Si encontramos datos, significa que el correo ya existe
      return !!data
    } catch (err) {
      console.error("Error inesperado al verificar el correo:", err)
      // En caso de error, procedemos con el registro
      return false
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const form = e.currentTarget
    const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim()
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim()
    const password = (form.elements.namedItem("password") as HTMLInputElement).value.trim()
    const confirmPassword = (form.elements.namedItem("confirmPassword") as HTMLInputElement).value.trim()

    setInputError({
      name: !name,
      email: !email || !validateEmail(email),
      password: !password || !validatePassword(password),
      confirmPassword: password !== confirmPassword,
    })

    if (!name || !email || !password || !confirmPassword) {
      setError("Todos los campos son obligatorios.")
      setIsLoading(false)
      return
    }

    if (!validateEmail(email)) {
      setError("El correo electrónico no es válido.")
      setIsLoading(false)
      return
    }

    if (!validatePassword(password)) {
      setError("La contraseña debe tener al menos 6 caracteres, una mayúscula y un carácter especial.")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.")
      setIsLoading(false)
      return
    }

    try {
      // Verificamos si el correo ya existe en la tabla auth.users
      const emailExists = await checkEmailExists(email)

      if (emailExists) {
        setError("Este correo electrónico ya está registrado.")
        setInputError((prev) => ({ ...prev, email: true }))
        setIsLoading(false)
        return
      }

      // Si el correo no existe, procedemos con el registro
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: name },
        },
      })

      // Si hay un error durante el registro
      if (signUpError) {
        // Registramos el error completo para depuración
        console.error("Signup error:", signUpError)

        // Verificamos si el error indica que el correo ya existe
        const errorMsg = signUpError.message.toLowerCase()

        if (
          errorMsg.includes("already registered") ||
          errorMsg.includes("already taken") ||
          errorMsg.includes("email already") ||
          errorMsg.includes("user already registered") ||
          errorMsg.includes("already exists") ||
          errorMsg.includes("already in use")
        ) {
          setError("Este correo electrónico ya está registrado.")
          setInputError((prev) => ({ ...prev, email: true }))
        } else {
          // Otro tipo de error
          setError(signUpError.message || "Error al registrarse. Intenta nuevamente.")
        }
        setIsLoading(false)
        return
      }

      // Verificamos si se creó el usuario correctamente
      if (data && data.user) {
        console.log("Registration successful:", data.user)
        Swal.fire({
          title: "Registro exitoso",
          text: "Por favor revisa tu correo para confirmar tu cuenta.",
          icon: "success",
          confirmButtonText: "Continuar",
        }).then(() => navigate("/"))
      } else {
        // Si no hay usuario creado pero tampoco hay error, algo salió mal
        console.error("No user data returned:", data)
        setError("Error al registrarse. Por favor, intenta nuevamente.")
      }
    } catch (err) {
      console.error("Error inesperado:", err)
      setError("Error inesperado al registrarse. Intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDiscordSignup = async () => {
    setIsLoading(true)
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: "http://localhost:3000/dashboard/", // Cambia esto por tu URL de redirección
      },
    })
    setIsLoading(false)

    if (error) {
      setError("Error al registrarse con Discord: " + error.message)
      return
    }

    Swal.fire({
      title: "Registro exitoso",
      text: "Te has registrado con Discord correctamente.",
      icon: "success",
      confirmButtonText: "Continuar",
    }).then(() => navigate("/"))
  }

  const togglePasswordVisibility = (field: "password" | "confirmPassword") => {
    if (field === "password") {
      setShowPassword(!showPassword)
    } else {
      setShowConfirmPassword(!showConfirmPassword)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Registro de Usuario</h1>

        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="error-message">
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="name">Nombre</label>
          <input
            type="text"
            id="name"
            name="name"
            className={inputError.name ? "input-error" : ""}
            placeholder="Introduce tu nombre"
            maxLength={40}
            disabled={isLoading}
          />

          <label htmlFor="email">Correo electrónico</label>
          <input
            type="email"
            id="email"
            name="email"
            className={inputError.email ? "input-error" : ""}
            placeholder="Introduce tu correo electrónico"
            maxLength={40}
            disabled={isLoading}
          />

          <label htmlFor="password">Contraseña</label>
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              className={inputError.password ? "input-error" : ""}
              placeholder="Contraseña "
              maxLength={40}
              disabled={isLoading}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => togglePasswordVisibility("password")}
              disabled={isLoading}
            >
              <span>{showPassword ? <EyeSlashIcon /> : <EyeIcon />}</span>
            </button>
          </div>

          <label htmlFor="confirmPassword">Confirmar Contraseña</label>
          <div className="password-container">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              className={inputError.confirmPassword ? "input-error" : ""}
              placeholder="Confirma tu contraseña"
              maxLength={40}
              disabled={isLoading}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => togglePasswordVisibility("confirmPassword")}
              disabled={isLoading}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? "Procesando..." : "Registrarse"}
          </button>
        </form>

        <p className="register-link">
          ¿Ya tienes cuenta? <a href="/">Inicia sesión</a>
        </p>

        <div className="divider">
          <span>O registrarte con</span>
        </div>
        <button type="button" className="submit-btn discord-btn" onClick={handleDiscordSignup} disabled={isLoading}>
          <img src={Discord || "/placeholder.svg"} alt="Discord" className="discord-icon" />
          Registrarse con Discord
        </button>
      </div>
    </div>
  )
}

export default Register

