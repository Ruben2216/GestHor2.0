/**
 * ============================================================================
 * GestHor 2.0 - Enrutador Principal con Protección y Control Visual por Rol
 * Integrante 3 — Frontend, sesión y control visual por rol
 * ============================================================================
 */

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Autenticación
import LoginForm from "./functionalities/LoginForm";
import RecoveryForm from "./functionalities/RecoveryForm";
import AuthCallback from "./functionalities/AuthCallback";

// Profesor
import MiHorario from "./functionalities/Profesor/MiHorario.jsx";
import MisMaterias from "./functionalities/Profesor/MisMaterias.jsx";
import Disponibilidad from "./functionalities/Profesor/Disponibilidad.jsx";

// Alumno (Solo consulta)
import AlumnoLayout from "./functionalities/Alumno/AlumnoLayout.jsx";
import ConsultaHorarios from "./functionalities/Alumno/ConsultaHorarios.jsx";
import ConsultaMaterias from "./functionalities/Alumno/ConsultaMaterias.jsx";

// Admin / Editor
import AdminLayout from "./functionalities/Administrador/AdminLayout.jsx";
import AdminDashboard from "./functionalities/Administrador/Dashboard.jsx";
import Docentes from "./functionalities/Administrador/Docentes.jsx";
import Materias from "./functionalities/Administrador/Materias.jsx";
import PlanesEstudio from "./functionalities/Administrador/PlanesEstudio.jsx";
import Lugares from "./functionalities/Administrador/Lugares.jsx";
import Horarios from "./functionalities/Administrador/Horarios.jsx";
import Solicitudes from "./functionalities/Administrador/Solicitudes.jsx";
import Periodos from "./functionalities/Administrador/Periodos.jsx";
import Auditoria from "./functionalities/Administrador/Auditoria.jsx";
import RolesPermisos from "./functionalities/Administrador/RolesPermisos.jsx";
import UsuariosRoles from "./functionalities/Administrador/UsuariosRoles.jsx";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ==================== Rutas Públicas de Auth ==================== */}
          <Route path="/" element={<LoginForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/recovery" element={<RecoveryForm />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* ==================== Rutas del Profesor ==================== */}
          <Route
            path="/profesor/mi-horario"
            element={
              <ProtectedRoute allowedRoles={["profesor", "administrador"]}>
                <MiHorario />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profesor/mis-materias"
            element={
              <ProtectedRoute allowedRoles={["profesor", "administrador"]}>
                <MisMaterias />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profesor/disponibilidad"
            element={
              <ProtectedRoute allowedRoles={["profesor", "administrador"]}>
                <Disponibilidad />
              </ProtectedRoute>
            }
          />

          {/* ==================== Rutas del Alumno (Solo Consulta) ==================== */}
          <Route
            path="/alumno"
            element={
              <ProtectedRoute allowedRoles={["alumno", "estudiante", "usuario_regular", "administrador", "editor", "docente", "profesor"]}>
                <AlumnoLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="horarios" replace />} />
            <Route path="horarios" element={<ConsultaHorarios />} />
            <Route path="materias" element={<ConsultaMaterias />} />
          </Route>

          {/* ==================== Rutas Admin / Editor con Layout ==================== */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["administrador", "editor", "docente"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* Redirige /admin a /admin/dashboard */}
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="docentes" element={<Docentes />} />
            <Route path="materias" element={<Materias />} />
            <Route path="planes" element={<PlanesEstudio />} />
            <Route path="lugares" element={<Lugares />} />
            <Route path="configuracion" element={<Periodos />} />
            <Route path="periodos" element={<Navigate to="/admin/configuracion" replace />} />
            <Route path="horarios" element={<Horarios />} />
            <Route path="solicitudes" element={<Solicitudes />} />

            {/* Módulos Exclusivos de Administrador (Bloqueados para el Editor) */}
            <Route
              path="roles"
              element={
                <ProtectedRoute allowedRoles={["administrador"]}>
                  <RolesPermisos />
                </ProtectedRoute>
              }
            />
            <Route
              path="usuarios"
              element={
                <ProtectedRoute allowedRoles={["administrador"]}>
                  <UsuariosRoles />
                </ProtectedRoute>
              }
            />
            <Route
              path="auditoria"
              element={
                <ProtectedRoute allowedRoles={["administrador"]}>
                  <Auditoria />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Rutas legacy */}
          <Route
            path="/admin/admin-dashboard"
            element={<Navigate to="/admin/dashboard" replace />}
          />

          {/* 404 No Encontrado */}
          <Route
            path="*"
            element={
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                background: "#f8fafc",
                fontFamily: "system-ui, sans-serif"
              }}>
                <h1 style={{ fontSize: 36, fontWeight: 800, color: "#1e293b", marginBottom: 8 }}>404</h1>
                <p style={{ color: "#64748b", marginBottom: 20 }}>La página solicitada no existe o fue movida.</p>
                <a
                  href="/login"
                  style={{
                    padding: "10px 20px",
                    background: "#1d4ed8",
                    color: "#fff",
                    borderRadius: 8,
                    textDecoration: "none",
                    fontWeight: 600
                  }}
                >
                  Volver al inicio
                </a>
              </div>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
