import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../components/ui/NotificacionFlotante";

function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { notify } = useToast();

  useEffect(() => {
    const token = searchParams.get("token");
    const userStr = searchParams.get("user");
    const redirectTo = searchParams.get("redirectTo");
    const error = searchParams.get("error");

    if (error) {
      let errorMessage = "Error en la autenticación";
      
      switch (error) {
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
      
  notify({ type: 'error', message: errorMessage });
      navigate("/login");
      return;
    }

    if (token && userStr && redirectTo) {
      // Guardar token y usuario en localStorage
      localStorage.setItem("token", token);
      
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        localStorage.setItem("user", JSON.stringify({
          usuario_id: user.id,
          email: user.email,
          rol: user.rol
        }));
        
        // Redirigir según el rol
        navigate(redirectTo);
      } catch (err) {
        console.error("Error al procesar datos del usuario:", err);
        notify({ type: 'error', message: 'Error al procesar la información del usuario' });
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [searchParams, navigate]);

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      height: "100vh" 
    }}>
      <p>Procesando autenticación...</p>
    </div>
  );
}

export default AuthCallback;
