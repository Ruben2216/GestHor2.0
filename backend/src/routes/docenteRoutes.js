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
import { authorize, authorizeSelfOr } from "../middlewares/auth.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Estadísticas (debe ir ANTES de las rutas con parámetros)
router.get('/docentes/estadisticas', authorize('docentes:leer'), obtenerEstadisticasDocentesController);

// CRUD de docentes
router.get('/docentes', authorize('docentes:leer'), obtenerDocentesController);
router.get('/docentes/:id', authorize('docentes:leer'), obtenerDocentePorIdController);
// El profesor puede consultar su propio nombre
router.get('/profesor/nombre/:id', authorizeSelfOr('id', 'docentes:leer'), obtenerNombreProfesorController);
router.post('/docentes', authorize('docentes:crear'), insertarDocenteController);
router.put('/docentes/:id', authorize('docentes:editar'), actualizarDocenteController);
router.delete('/docentes/:id', authorize('docentes:eliminar'), eliminarDocenteController);

// Ruta para enviar horario por correo
router.post('/docentes/:id/enviar-horario', authorize('docentes:editar'), upload.single('horarioPdf'), enviarHorarioController);

router.post('/insertardocente', authorize('docentes:crear'), insertarDocenteController);

export default router;
