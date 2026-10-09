import { Router } from "express";
import { obtenerTiposContratoController, crearTipoContratoController, actualizarTipoContratoController } from "../controllers/tipoContratoController.js";
import { authorize } from "../middlewares/auth.js";

const router = Router();

// GET /api/tipos-contrato
router.get('/tipos-contrato', authorize('editores:leer'), obtenerTiposContratoController);

// POST /api/tipos-contrato
router.post('/tipos-contrato', authorize('editores:editar'), crearTipoContratoController);

// PUT /api/tipos-contrato/:id
router.put('/tipos-contrato/:id', authorize('editores:editar'), actualizarTipoContratoController);

export default router;
