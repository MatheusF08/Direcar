import { Router } from 'express';
import {
  create,
  getAll,
  getById,
  updateFull,
  deleteEstimate
} from '../controllers/estimate.controller';

import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticateToken, create);
router.get('/', authenticateToken, getAll);
router.get('/:id', authenticateToken, getById);

// 🔥 UPDATE COMPLETO
router.put('/:id', authenticateToken, updateFull);

router.delete('/:id', authenticateToken, deleteEstimate);

export default router;