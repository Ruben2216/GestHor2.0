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

const router = express.Router();

// Rutas para catálogo de materias
router.get('/materias', obtenerMateriasController);
router.get('/materias/buscar', buscarMateriasController); // ?q=matematicas
router.get('/materias/carrera/:carreraId', obtenerMateriasPorCarreraController);
router.get('/materias/carrera/:carreraId/semestre/:semestre', obtenerMateriasPorCarreraYSemestreController);
router.get('/materias/:id', obtenerMateriaPorIdController);
router.post('/materias', insertarMateriaController); // Agregar al catálogo
router.put('/materias/:id', actualizarMateriaController);
router.delete('/materias/:id', eliminarMateriaController);

// Rutas para asignar/desasignar materias a carreras
router.post('/materias/asignar', asignarMateriaACarreraController);
router.delete('/materias/desasignar/:carreraId/:materiaId/:semestre', desasignarMateriaDeCarreraController);

export default router;
