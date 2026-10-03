import express from "express";
import {
  crearPeriodoController,
  obtenerPeriodosController,
  obtenerPeriodoPorIdController,
  actualizarPeriodoController,
  eliminarPeriodoController,
} from "../controllers/periodoController.js";
import { authorize } from "../middlewares/auth.js";

const router = express.Router();

// CRUD de periodos
router.get('/periodos', authorize('periodos:leer'), obtenerPeriodosController);
router.get('/periodos/:id', authorize('periodos:leer'), obtenerPeriodoPorIdController);
router.post('/periodos', authorize('periodos:crear'), crearPeriodoController);
router.put('/periodos/:id', authorize('periodos:editar'), actualizarPeriodoController);
router.delete('/periodos/:id', authorize('periodos:eliminar'), eliminarPeriodoController);

export default router;
