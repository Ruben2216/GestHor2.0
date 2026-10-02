import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import styles from "../styles/LoginForm.module.css";
import PasswordInput from "../components/ui/PasswordInput";
import usePageTitle from "../hooks/usePageTitle";


function LoginForm() {
   usePageTitle("Ingresar al sitio");
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState("");
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Verificar si hay un error de Google OAuth en la URL
    const oauthError = searchParams.get("error");
    if (oauthError) {
      let errorMessage = "Error en la autenticación";
      
      switch (oauthError) {
        case "user_not_found":
          errorMessage = "Usuario no encontrado en la base de datos";
          break;
        case "no_email":
          errorMessage = "No se pudo obtener el email de Google";
          break;
        case "auth_failed":
          errorMessage = "Falló la autenticación con Google";
          break;
        case "server_error":
          errorMessage = "Error en el servidor";
          break;
        default:
          errorMessage = "Error desconocido";
      }
      
      setError(errorMessage);
      // Limpiar el parámetro de error de la URL
      window.history.replaceState({}, '', '/login');
    }
  }, [searchParams]);

  const handleInputChange = (event) => {
    const { id, value } = event.target;
    if (id === "correo") setCorreo(value);
    else if (id === "contraseña") setContraseña(value);
    else if (id === "tipoUsuario") setTipoUsuario(value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setCargando(true);

    try {
      // enviar datos al backend
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // se manda tambien tipoUsuario para validarlo en el backend
        body: JSON.stringify({ correo, contraseña, tipoUsuario }),
      });

      const result = await response.json();

      // si hay error (credenciales o rol incorrecto)
      if (!response.ok || !result.ok) {
        setError(result?.message || "Error en el login");
        setCargando(false);
        return;
      }

      // si todo esta bien, redirige según el rol
      const rol = result?.usuario?.rol;

      // Guardar token y usuario en localStorage
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify({
        usuario_id: result.usuario.id,
        email: result.usuario.email,
        rol: result.usuario.rol
      }));

      if (rol === "administrador") {
        navigate("/admin/admin-dashboard");
      } else if (rol === "profesor") {
        navigate("/profesor/mi-horario");
      } else {
        navigate("/");
      }

    } catch (err) {
      console.error("Error al conectar con el servidor:", err);
      setError("No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirigir a la ruta de autenticación de Google en el backend
    window.location.href = "http://localhost:3000/api/auth/google";
  };

  return (
    <div className={styles.loginBackground}>
      <div className={styles.loginContent}>
        <div className={styles.infoSection}>
          <h1 className={styles.systemTitle}>SISTEMA DE HORARIOS</h1>
          <h3 className={styles.systemSubtitle}>Gestión escolar - UNACH</h3>
          <p className={styles.infoText}>
            Bienvenido al sistema para administrar y consultar los horarios de clase.
            <br />
            Inicia sesión para continuar.
          </p>
        </div>

        <div className={styles.loginCardwrapper}>
          <div className={styles.loginCard}>
            <h2 className={styles.cardTitle}>INICIO DE SESIÓN</h2>
            <p className={styles.cardSubtitle}>
              Por favor, ingresa tus datos para continuar
            </p>

            <form onSubmit={handleSubmit} className={styles.loginForm}>
              <div className={styles.formGroup}>
                <label htmlFor="correo">Correo</label>
                <input
                  type="email"
                  id="correo"
                  value={correo}
                  onChange={handleInputChange}
                  required
                  className={styles.inputField}
                  placeholder="Tucorreo@unach.mx"
                />
              </div>

              <PasswordInput
                id="contraseña"
                value={contraseña}
                onChange={handleInputChange}
                placeholder="Ingresa tu contraseña o token de acceso"
                required={true}
                label="Contraseña"
              />

              <div className={styles.forgotPasswordLink}>
                <Link to="/recovery">¿Necesitas Ayuda?</Link>
              </div>

              {error && <div className={styles.errorMsg}>{error}</div>}

              <button
                type="submit"
                className={styles.loginButton}
                disabled={cargando}
              >
                {cargando ? "VALIDANDO..." : "INICIAR SESIÓN"}
              </button>

              <div className={styles.divider}>
                <span>O</span>
              </div>

              <button
                type="button"
                className={styles.googleButton}
                onClick={handleGoogleLogin}
              >
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                </svg>
                Iniciar sesión con Google
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
