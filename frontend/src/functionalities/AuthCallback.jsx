import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../components/ui/NotificacionFlotante";
import authStorage from "../services/authStorage";
import { useAuth } from "../hooks/useAuth";

function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { notify } = useToast();
  const { loadUserPermissions } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken");
    const userStr = searchParams.get("user");
    const redirectTo = searchParams.get("redirectTo");
    const error = searchParams.get("error");

    if (error) {
      let errorMessage = "Error en la autenticación";
      
      switch (error) {
        case "user_not_found":
          errorMessage = "Usuario no registrado en el sistema";
          break;
        case "no_email":
          errorMessage = "No se pudo obtener el correo de Google";
          break;
        case "auth_failed":
          errorMessage = "Falló la autenticación con Google";
          break;
        case "server_error":
          errorMessage = "Error en el servidor de autenticación";
          break;
        default:
          errorMessage = "Error durante el inicio de sesión";
      }
      
      notify({ type: 'error', message: errorMessage });
      navigate("/login");
      return;
    }

    if (token && userStr) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userStr));
        const userData = {
          id: parsedUser.id || parsedUser.usuario_id,
          usuario_id: parsedUser.id || parsedUser.usuario_id,
          email: parsedUser.email,
          rol: parsedUser.rol || parsedUser.nombre_rol,
          nombre: parsedUser.nombre || parsedUser.nombres || parsedUser.email.split('@')[0],
        };

        authStorage.saveSession({
          accessToken: token,
          refreshToken: refreshToken || '',
          usuario: userData,
        });

        loadUserPermissions().finally(() => {
          if (redirectTo) {
            navigate(redirectTo);
          } else {
            const r = String(userData.rol || '').toLowerCase();
            if (r === "administrador" || r === "editor" || r === "docente") {
              navigate("/admin/dashboard");
            } else if (r === "profesor") {
              navigate("/profesor/mi-horario");
            } else if (r === "alumno" || r === "estudiante") {
              navigate("/alumno/horarios");
            } else {
              navigate("/login");
            }
          }
        });
      } catch (err) {
        console.error("Error al procesar datos de sesión:", err);
        notify({ type: 'error', message: 'Error al procesar la información de sesión' });
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [searchParams, navigate, notify, loadUserPermissions]);

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      height: "100vh",
      background: '#f8fafc',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid #cbd5e1',
          borderTopColor: '#1d4ed8',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 12px'
        }} />
        <p style={{ color: '#475569', fontWeight: 500 }}>Procesando autenticación...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

export default AuthCallback;
