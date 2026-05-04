// backend/src/routes/estimate.routes.ts - VERSÃO FINAL E CORRIGIDA

import { Router } from 'express';
import { create, getAll, getById, updateStatus, remove } from '../controllers/estimate.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Rota para criar um novo orçamento (protegida)
router.post('/', authenticateToken, create);

// Rota para obter todos os orçamentos (protegida)
router.get('/', authenticateToken, getAll);

// Rota para obter um orçamento específico por ID (protegida)
router.get('/:id', authenticateToken, getById);

// Rota para atualizar o status de um orçamento (protegida)
router.patch('/:id', authenticateToken, updateStatus);

// Rota para deletar um orçamento (protegida)
router.delete('/:id', authenticateToken, remove);

export default router;
