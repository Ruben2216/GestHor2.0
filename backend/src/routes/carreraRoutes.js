import express from "express";
import { 
    obtenerCarrerasController, 
    obtenerCarreraPorIdController, 
    insertarCarreraController, 
    actualizarCarreraController, 
    eliminarCarreraController,
    obtenerEstadisticasCarrerasController
} from "../controllers/carreraController.js";

const router = express.Router();

// Estadísticas (debe ir ANTES de las rutas con parámetros)
router.get('/carreras/estadisticas', obtenerEstadisticasCarrerasController);

// CRUD de carreras
router.get('/carreras', obtenerCarrerasController);
router.get('/carreras/:id', obtenerCarreraPorIdController);
router.post('/carreras', insertarCarreraController);
router.put('/carreras/:id', actualizarCarreraController);
router.delete('/carreras/:id', eliminarCarreraController);

export default router;
