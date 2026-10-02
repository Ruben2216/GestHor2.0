import { Router } from "express";
import { obtenerTiposContratoController, crearTipoContratoController, actualizarTipoContratoController } from "../controllers/tipoContratoController.js";

const router = Router();

// GET /api/tipos-contrato
router.get('/tipos-contrato', obtenerTiposContratoController);

// POST /api/tipos-contrato
router.post('/tipos-contrato', crearTipoContratoController);

// PUT /api/tipos-contrato/:id
router.put('/tipos-contrato/:id', actualizarTipoContratoController);

export default router;
