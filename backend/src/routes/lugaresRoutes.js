import express from 'express';
import * as lugaresController from '../controllers/lugaresController.js';

const router = express.Router();


// Estructura completa: lugares -> edificios -> salones
router.get('/lugares/estructura', lugaresController.obtenerEstructura);

// Rutas de lugares
router.get('/lugares', lugaresController.obtenerEstructura); // alias
router.post('/lugares', lugaresController.crearLugar);
router.put('/lugares/:id', lugaresController.actualizarLugar);
router.delete('/lugares/:id', lugaresController.eliminarLugarController);

// Rutas de edificios
router.get('/lugares/:lugarId/edificios', lugaresController.obtenerEstructura); // usa estructura para simplicidad
router.post('/edificios', lugaresController.crearEdificioController);
router.put('/edificios/:id', lugaresController.actualizarEdificioController);
router.delete('/edificios/:id', lugaresController.eliminarEdificioController);

// Rutas de salones
router.post('/salones', lugaresController.crearSalonController);
router.put('/salones/:id', lugaresController.actualizarSalonController);
router.delete('/salones/:id', lugaresController.eliminarSalonController);

export default router;