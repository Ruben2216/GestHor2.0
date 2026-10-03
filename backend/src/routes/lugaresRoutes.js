import express from 'express';
import * as lugaresController from '../controllers/lugaresController.js';
import { authorize } from '../middlewares/auth.js';

const router = express.Router();


// Estructura completa: lugares -> edificios -> salones
router.get('/lugares/estructura', authorize('lugares:leer'), lugaresController.obtenerEstructura);

// Rutas de lugares
router.get('/lugares', authorize('lugares:leer'), lugaresController.obtenerEstructura); // alias
router.post('/lugares', authorize('lugares:crear'), lugaresController.crearLugar);
router.put('/lugares/:id', authorize('lugares:editar'), lugaresController.actualizarLugar);
router.delete('/lugares/:id', authorize('lugares:eliminar'), lugaresController.eliminarLugarController);

// Rutas de edificios
router.get('/lugares/:lugarId/edificios', authorize('lugares:leer'), lugaresController.obtenerEstructura); // usa estructura para simplicidad
router.post('/edificios', authorize('lugares:crear'), lugaresController.crearEdificioController);
router.put('/edificios/:id', authorize('lugares:editar'), lugaresController.actualizarEdificioController);
router.delete('/edificios/:id', authorize('lugares:eliminar'), lugaresController.eliminarEdificioController);

// Rutas de salones
router.post('/salones', authorize('lugares:crear'), lugaresController.crearSalonController);
router.put('/salones/:id', authorize('lugares:editar'), lugaresController.actualizarSalonController);
router.delete('/salones/:id', authorize('lugares:eliminar'), lugaresController.eliminarSalonController);

export default router;