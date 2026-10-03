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
import { authorize } from '../middlewares/auth.js';

const router = express.Router();

// Pública: la crea un usuario que olvidó su contraseña (aún no tiene sesión)
router.post('/solicitudes-recuperacion', crearSolicitudController);

// Administración de solicitudes: gestiona cuentas de usuario
router.get('/solicitudes-recuperacion/pendientes', authorize('usuarios:leer'), obtenerSolicitudesPendientesController);
router.get('/solicitudes-recuperacion', authorize('usuarios:leer'), obtenerTodasSolicitudesController);
router.get('/solicitudes-recuperacion/estadisticas', authorize('usuarios:leer'), obtenerEstadisticasController);
router.get('/solicitudes-recuperacion/actividades', authorize('usuarios:leer'), obtenerActividadesRecientesController);
router.put('/solicitudes-recuperacion/:solicitudId/resolver', authorize('usuarios:editar'), resolverSolicitudController);
router.post('/solicitudes-recuperacion/:solicitudId/regenerar-password', authorize('usuarios:editar'), regenerarPasswordController);

export default router;
