import express from "express";
import multer from "multer";
import { 
    obtenerDocentesController, 
    obtenerDocentePorIdController,
    obtenerNombreProfesorController,
    insertarDocenteController, 
    actualizarDocenteController, 
    eliminarDocenteController,
    obtenerEstadisticasDocentesController,
    enviarHorarioController
} from "../controllers/docenteController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Estadísticas (debe ir ANTES de las rutas con parámetros)
router.get('/docentes/estadisticas', obtenerEstadisticasDocentesController);

// CRUD de docentes
router.get('/docentes', obtenerDocentesController);
router.get('/docentes/:id', obtenerDocentePorIdController);
router.get('/profesor/nombre/:id', obtenerNombreProfesorController);
router.post('/docentes', insertarDocenteController);
router.put('/docentes/:id', actualizarDocenteController);
router.delete('/docentes/:id', eliminarDocenteController);

// Ruta para enviar horario por correo
router.post('/docentes/:id/enviar-horario', upload.single('horarioPdf'), enviarHorarioController);

router.post('/insertardocente', insertarDocenteController);

export default router;
