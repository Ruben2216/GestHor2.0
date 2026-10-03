import express from "express";
import {
    obtenerCarrerasController,
    obtenerCarreraPorIdController,
    insertarCarreraController,
    actualizarCarreraController,
    eliminarCarreraController,
    obtenerEstadisticasCarrerasController
} from "../controllers/carreraController.js";
import { authorize } from "../middlewares/auth.js";

const router = express.Router();

// Estadísticas (debe ir ANTES de las rutas con parámetros)
router.get('/carreras/estadisticas', authorize('carreras:leer'), obtenerEstadisticasCarrerasController);

// CRUD de carreras
router.get('/carreras', authorize('carreras:leer'), obtenerCarrerasController);
router.get('/carreras/:id', authorize('carreras:leer'), obtenerCarreraPorIdController);
router.post('/carreras', authorize('carreras:crear'), insertarCarreraController);
router.put('/carreras/:id', authorize('carreras:editar'), actualizarCarreraController);
router.delete('/carreras/:id', authorize('carreras:eliminar'), eliminarCarreraController);

export default router;
