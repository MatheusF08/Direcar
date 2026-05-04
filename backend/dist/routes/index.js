"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// 1. CORREÇÃO: Importar 'authenticateToken' em vez de 'authMiddleware'
const auth_middleware_1 = require("../middleware/auth.middleware");
const estimate_controller_1 = require("../controllers/estimate.controller");
const router = (0, express_1.Router)();
// 2. CORREÇÃO: Usar 'authenticateToken' aqui também
router.post("/estimates", auth_middleware_1.authenticateToken, estimate_controller_1.handleCreateEstimate);
router.get("/estimates", auth_middleware_1.authenticateToken, estimate_controller_1.handleGetAllEstimates);
router.get("/estimates/:id", auth_middleware_1.authenticateToken, estimate_controller_1.handleGetEstimateById);
router.patch("/estimates/:id/status", auth_middleware_1.authenticateToken, estimate_controller_1.handleUpdateEstimate);
router.delete("/estimates/:id", auth_middleware_1.authenticateToken, estimate_controller_1.handleDeleteEstimate);
exports.default = router;
