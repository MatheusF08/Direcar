import { Router } from 'express';
// 1. CORREÇÃO: Importar 'authenticateToken' em vez de 'authMiddleware'
import { authenticateToken } from '../middleware/auth.middleware';
import {
  handleCreateEstimate,
  handleGetAllEstimates,
  handleGetEstimateById,
  handleUpdateEstimateStatus,
  handleDeleteEstimate
} from '../controllers/estimate.controller';

const router = Router();

// 2. CORREÇÃO: Usar 'authenticateToken' aqui também
router.post("/estimates", authenticateToken, handleCreateEstimate);
router.get("/estimates", authenticateToken, handleGetAllEstimates);
router.get("/estimates/:id", authenticateToken, handleGetEstimateById);
router.patch("/estimates/:id/status", authenticateToken, handleUpdateEstimateStatus);
router.delete("/estimates/:id", authenticateToken, handleDeleteEstimate);

export default router;
