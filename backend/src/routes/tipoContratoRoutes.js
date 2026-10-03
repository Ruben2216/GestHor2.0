import { Router } from "express";
import { obtenerTiposContratoController, crearTipoContratoController, actualizarTipoContratoController } from "../controllers/tipoContratoController.js";
import { authorize } from "../middlewares/auth.js";

const router = Router();

// GET /api/tipos-contrato
router.get('/tipos-contrato', authorize('docentes:leer'), obtenerTiposContratoController);

// POST /api/tipos-contrato
router.post('/tipos-contrato', authorize('docentes:editar'), crearTipoContratoController);

// PUT /api/tipos-contrato/:id
router.put('/tipos-contrato/:id', authorize('docentes:editar'), actualizarTipoContratoController);

export default router;
