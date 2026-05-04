"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDeleteEstimate = exports.handleUpdateEstimate = exports.handleGetEstimateById = exports.handleGetAllEstimates = exports.handleCreateEstimate = void 0;
const estimateService = __importStar(require("../services/estimate.service"));
// ==============================
// CREATE
// ==============================
const handleCreateEstimate = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(403).json({
                message: 'ID do usuário não encontrado no token.'
            });
        }
        const estimateData = req.body;
        const newEstimate = await estimateService.createEstimate(estimateData, userId);
        res.status(201).json(newEstimate);
    }
    catch (error) {
        console.error('Erro ao criar orçamento:', error);
        res.status(500).json({
            message: 'Erro interno ao criar orçamento',
            error: error.message
        });
    }
};
exports.handleCreateEstimate = handleCreateEstimate;
// ==============================
// GET ALL
// ==============================
const handleGetAllEstimates = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(403).json({
                message: 'ID do usuário não encontrado no token.'
            });
        }
        const estimates = await estimateService.getAllEstimatesByUserId(userId);
        res.json(estimates);
    }
    catch (error) {
        console.error('Erro ao buscar orçamentos:', error);
        res.status(500).json({
            message: 'Erro interno ao buscar orçamentos',
            error: error.message
        });
    }
};
exports.handleGetAllEstimates = handleGetAllEstimates;
// ==============================
// GET BY ID
// ==============================
const handleGetEstimateById = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const estimateId = parseInt(req.params.id);
        if (!userId) {
            return res.status(403).json({
                message: 'ID do usuário não encontrado no token.'
            });
        }
        const estimate = await estimateService.getEstimateById(estimateId);
        if (!estimate) {
            return res.status(404).json({
                message: 'Orçamento não encontrado.'
            });
        }
        // 🔒 valida dono
        if (estimate.userId !== userId) {
            return res.status(403).json({
                message: 'Acesso negado.'
            });
        }
        res.json(estimate);
    }
    catch (error) {
        console.error('Erro ao buscar orçamento:', error);
        res.status(500).json({
            message: 'Erro interno',
            error: error.message
        });
    }
};
exports.handleGetEstimateById = handleGetEstimateById;
// ==============================
// UPDATE
// ==============================
const handleUpdateEstimate = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const estimateId = parseInt(req.params.id);
        const data = req.body;
        if (!userId) {
            return res.status(403).json({
                message: 'ID do usuário não encontrado no token.'
            });
        }
        const existingEstimate = await estimateService.getEstimateById(estimateId);
        if (!existingEstimate) {
            return res.status(404).json({
                message: 'Orçamento não encontrado.'
            });
        }
        if (existingEstimate.userId !== userId) {
            return res.status(403).json({
                message: 'Acesso negado. Você não é o proprietário deste orçamento.'
            });
        }
        const updatedEstimate = await estimateService.updateEstimate(estimateId, data);
        res.json(updatedEstimate);
    }
    catch (error) {
        console.error('Erro ao atualizar orçamento:', error);
        res.status(500).json({
            message: 'Erro ao atualizar orçamento',
            error: error.message
        });
    }
};
exports.handleUpdateEstimate = handleUpdateEstimate;
// ==============================
// DELETE
// ==============================
const handleDeleteEstimate = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const estimateId = parseInt(req.params.id);
        if (!userId) {
            return res.status(403).json({
                message: 'ID do usuário não encontrado no token.'
            });
        }
        const existingEstimate = await estimateService.getEstimateById(estimateId);
        if (!existingEstimate) {
            return res.status(404).json({
                message: 'Orçamento não encontrado.'
            });
        }
        if (existingEstimate.userId !== userId) {
            return res.status(403).json({
                message: 'Acesso negado. Você não é o proprietário deste orçamento.'
            });
        }
        await estimateService.deleteEstimate(estimateId);
        res.status(204).send();
    }
    catch (error) {
        console.error('Erro ao deletar orçamento:', error);
        res.status(500).json({
            message: 'Erro ao deletar orçamento',
            error: error.message
        });
    }
};
exports.handleDeleteEstimate = handleDeleteEstimate;
