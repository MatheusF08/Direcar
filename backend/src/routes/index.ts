// backend/src/routes/index.ts - VERSÃO FINAL E CORRIGIDA

import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { 
  create, 
  getAll, 
  getById, 
  updateStatus, 
  remove 
} from '../controllers/estimate.controller';
import { register, login } from '../controllers/auth.controller';

const router = Router();

// --- Rotas de Autenticação ---
router.post('/auth/register', register);
router.post('/auth/login', login);

// --- Rotas de Orçamentos (Protegidas) ---
// Todas as rotas abaixo exigem um token de autenticação válido

// Criar um novo orçamento
router.post('/estimates', authenticateToken, create);

// Obter todos os orçamentos
router.get('/estimates', authenticateToken, getAll);

// Obter um orçamento específico por ID
router.get('/estimates/:id', authenticateToken, getById);

// Atualizar o status de um orçamento
router.patch('/estimates/:id', authenticateToken, updateStatus);

// Deletar um orçamento
router.delete('/estimates/:id', authenticateToken, remove);

export default router;
