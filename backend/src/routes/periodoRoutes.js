import express from "express";
import {
  crearPeriodoController,
  obtenerPeriodosController,
  obtenerPeriodoPorIdController,
  actualizarPeriodoController,
  eliminarPeriodoController,
} from "../controllers/periodoController.js";

const router = express.Router();

// CRUD de periodos
router.get('/periodos', obtenerPeriodosController);
router.get('/periodos/:id', obtenerPeriodoPorIdController);
router.post('/periodos', crearPeriodoController);
router.put('/periodos/:id', actualizarPeriodoController);
router.delete('/periodos/:id', eliminarPeriodoController);

export default router;
