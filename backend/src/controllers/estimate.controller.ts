import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import * as estimateService from '../services/estimate.service';

// ==============================
// CREATE
// ==============================
export const handleCreateEstimate = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(403).json({
        message: 'ID do usuário não encontrado no token.'
      });
    }

    const estimateData = req.body;

    const newEstimate = await estimateService.createEstimate(
      estimateData,
      userId
    );

    res.status(201).json(newEstimate);
  } catch (error: any) {
    console.error('Erro ao criar orçamento:', error);

    res.status(500).json({
      message: 'Erro interno ao criar orçamento',
      error: error.message
    });
  }
};

// ==============================
// GET ALL
// ==============================
export const handleGetAllEstimates = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(403).json({
        message: 'ID do usuário não encontrado no token.'
      });
    }

    const estimates =
      await estimateService.getAllEstimatesByUserId(userId);

    res.json(estimates);
  } catch (error: any) {
    console.error('Erro ao buscar orçamentos:', error);

    res.status(500).json({
      message: 'Erro interno ao buscar orçamentos',
      error: error.message
    });
  }
};

// ==============================
// GET BY ID
// ==============================
export const handleGetEstimateById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    const estimateId = parseInt(req.params.id);

    if (!userId) {
      return res.status(403).json({
        message: 'ID do usuário não encontrado no token.'
      });
    }

    const estimate = await estimateService.getEstimateById(
      estimateId
    );

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
  } catch (error: any) {
    console.error('Erro ao buscar orçamento:', error);

    res.status(500).json({
      message: 'Erro interno',
      error: error.message
    });
  }
};

// ==============================
// UPDATE
// ==============================
export const handleUpdateEstimate = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    const estimateId = parseInt(req.params.id);
    const data = req.body;

    if (!userId) {
      return res.status(403).json({
        message: 'ID do usuário não encontrado no token.'
      });
    }

    const existingEstimate =
      await estimateService.getEstimateById(estimateId);

    if (!existingEstimate) {
      return res.status(404).json({
        message: 'Orçamento não encontrado.'
      });
    }

    if (existingEstimate.userId !== userId) {
      return res.status(403).json({
        message:
          'Acesso negado. Você não é o proprietário deste orçamento.'
      });
    }

    const updatedEstimate =
      await estimateService.updateEstimate(estimateId, data);

    res.json(updatedEstimate);
  } catch (error: any) {
    console.error('Erro ao atualizar orçamento:', error);

    res.status(500).json({
      message: 'Erro ao atualizar orçamento',
      error: error.message
    });
  }
};

// ==============================
// DELETE
// ==============================
export const handleDeleteEstimate = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    const estimateId = parseInt(req.params.id);

    if (!userId) {
      return res.status(403).json({
        message: 'ID do usuário não encontrado no token.'
      });
    }

    const existingEstimate =
      await estimateService.getEstimateById(estimateId);

    if (!existingEstimate) {
      return res.status(404).json({
        message: 'Orçamento não encontrado.'
      });
    }

    if (existingEstimate.userId !== userId) {
      return res.status(403).json({
        message:
          'Acesso negado. Você não é o proprietário deste orçamento.'
      });
    }

    await estimateService.deleteEstimate(estimateId);

    res.status(204).send();
  } catch (error: any) {
    console.error('Erro ao deletar orçamento:', error);

    res.status(500).json({
      message: 'Erro ao deletar orçamento',
      error: error.message
    });
  }
};