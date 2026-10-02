import express from 'express';
import {
    crearSolicitudController,
    obtenerSolicitudesPendientesController,
    obtenerTodasSolicitudesController,
    resolverSolicitudController,
    obtenerEstadisticasController,
    regenerarPasswordController,
    obtenerActividadesRecientesController
} from '../controllers/solicitudRecuperacionController.js';

const router = express.Router();

router.post('/solicitudes-recuperacion', crearSolicitudController);
router.get('/solicitudes-recuperacion/pendientes', obtenerSolicitudesPendientesController);
router.get('/solicitudes-recuperacion', obtenerTodasSolicitudesController);
router.get('/solicitudes-recuperacion/estadisticas', obtenerEstadisticasController);
router.get('/solicitudes-recuperacion/actividades', obtenerActividadesRecientesController);
router.put('/solicitudes-recuperacion/:solicitudId/resolver', resolverSolicitudController);
router.post('/solicitudes-recuperacion/:solicitudId/regenerar-password', regenerarPasswordController);

export default router;
