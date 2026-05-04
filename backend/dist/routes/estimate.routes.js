"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const estimate_controller_1 = require("../controllers/estimate.controller");
const router = (0, express_1.Router)();
// Aplica o middleware de autenticação em todas as rotas de orçamento
router.use(auth_middleware_1.authenticateToken);
// Rota para criar um novo orçamento
router.post('/', estimate_controller_1.handleCreateEstimate);
// Rota para buscar todos os orçamentos do usuário logado
router.get('/', estimate_controller_1.handleGetAllEstimates);
// Rota para atualizar um orçamento específico (ex: mudar status)
router.patch('/:id', estimate_controller_1.handleUpdateEstimate);
// Rota para deletar um orçamento específico
router.delete('/:id', estimate_controller_1.handleDeleteEstimate);
exports.default = router;
