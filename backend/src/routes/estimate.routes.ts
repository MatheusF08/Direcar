import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  handleCreateEstimate,
  handleGetAllEstimates,
  handleUpdateEstimate,
  handleDeleteEstimate,
} from '../controllers/estimate.controller';

const router = Router();

// Aplica o middleware de autenticação em todas as rotas de orçamento
router.use(authenticateToken);

// Rota para criar um novo orçamento
router.post('/', handleCreateEstimate);

// Rota para buscar todos os orçamentos do usuário logado
router.get('/', handleGetAllEstimates);

// Rota para atualizar um orçamento específico (ex: mudar status)
router.patch('/:id', handleUpdateEstimate);

// Rota para deletar um orçamento específico
router.delete('/:id', handleDeleteEstimate);

export default router;
