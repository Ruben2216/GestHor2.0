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
router.get('/docentes/estadisticas', authorize('editores:leer'), obtenerEstadisticasDocentesController);

// CRUD de docentes
router.get('/docentes', authorize('editores:leer'), obtenerDocentesController);
router.get('/docentes/:id', authorize('editores:leer'), obtenerDocentePorIdController);
// El profesor puede consultar su propio nombre
router.get('/profesor/nombre/:id', authorizeSelfOr('id', 'editores:leer'), obtenerNombreProfesorController);
router.post('/docentes', authorize('editores:crear'), insertarDocenteController);
router.put('/docentes/:id', authorize('editores:editar'), actualizarDocenteController);
router.delete('/docentes/:id', authorize('editores:eliminar'), eliminarDocenteController);

// Ruta para enviar horario por correo
router.post('/docentes/:id/enviar-horario', authorize('editores:editar'), upload.single('horarioPdf'), enviarHorarioController);

router.post('/insertardocente', authorize('editores:crear'), insertarDocenteController);

export default router;
