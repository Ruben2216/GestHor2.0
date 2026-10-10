import express from "express";
import {
    obtenerMateriasController,
    obtenerMateriasPorCarreraController,
    obtenerMateriasPorCarreraYSemestreController,
    obtenerMateriaPorIdController,
    insertarMateriaController,
    actualizarMateriaController,
    eliminarMateriaController,
    asignarMateriaACarreraController,
    desasignarMateriaDeCarreraController,
    buscarMateriasController
} from "../controllers/materiaController.js";
import { authorize } from "../middlewares/auth.js";

const router = express.Router();

// Rutas para catálogo de materias
router.get('/materias', authorize('materias:leer'), obtenerMateriasController);
router.get('/materias/buscar', authorize('materias:leer'), buscarMateriasController); // ?q=matematicas
router.get('/materias/carrera/:carreraId', authorize('materias:leer'), obtenerMateriasPorCarreraController);
router.get('/materias/carrera/:carreraId/semestre/:semestre', authorize('materias:leer'), obtenerMateriasPorCarreraYSemestreController);
router.get('/materias/:id', authorize('materias:leer'), obtenerMateriaPorIdController);
router.post('/materias', authorize('materias:crear'), insertarMateriaController); // Agregar al catálogo
router.put('/materias/:id', authorize('materias:editar'), actualizarMateriaController);
router.delete('/materias/:id', authorize('materias:eliminar'), eliminarMateriaController);

// Rutas para asignar/desasignar materias a carreras (plan de estudios)
router.post('/materias/asignar', authorize('materias:editar'), asignarMateriaACarreraController);
router.post('/carreras/:carreraId/materias', authorize('materias:editar'), asignarMateriaACarreraController);
router.get('/carreras/:carreraId/materias', authorize('materias:leer'), obtenerMateriasPorCarreraController);
router.delete('/materias/desasignar/:carreraId/:materiaId/:semestre', authorize('materias:editar'), desasignarMateriaDeCarreraController);
router.delete('/carreras/:carreraId/materias/:materiaId/:semestre', authorize('materias:editar'), desasignarMateriaDeCarreraController);

export default router;
