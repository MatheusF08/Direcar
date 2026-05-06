import { Request, Response } from 'express';
import * as EstimateService from '../services/estimate.service';

/**
 * CREATE ESTIMATE
 */
export const create = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Não autorizado.' });
  }

  try {
    const estimateData = {
      ...req.body,
      userId: req.user.userId,
    };

    const newEstimate = await EstimateService.createEstimate(estimateData);

    return res.status(201).json(newEstimate);
  } catch (error: any) {
    console.error("🔥 Erro ao criar orçamento:", error);
    return res.status(500).json({
      message: error.message || 'Erro interno do servidor.'
    });
  }
};

/**
 * GET ALL ESTIMATES
 */
export const getAll = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Não autorizado.' });
  }

  try {
    const estimates = await EstimateService.getAllEstimates(req.user.userId);

    return res.status(200).json(estimates);
  } catch (error: any) {
    console.error("🔥 Erro ao buscar orçamentos:", error);
    return res.status(500).json({
      message: error.message || 'Erro interno do servidor.'
    });
  }
};

/**
 * GET BY ID
 */
export const getById = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Não autorizado.' });
  }

  try {
    const id = Number(req.params.id);

    const estimate = await EstimateService.getEstimateById(
      id,
      req.user.userId
    );

    if (!estimate) {
      return res.status(404).json({
        message: 'Orçamento não encontrado.'
      });
    }

    return res.status(200).json(estimate);
  } catch (error: any) {
    console.error("🔥 Erro ao buscar orçamento:", error);
    return res.status(500).json({
      message: error.message || 'Erro interno do servidor.'
    });
  }
};

/**
 * 🔥 UPDATE COMPLETO (EDITAR TUDO)
 * - status
 * - peças
 * - serviços
 * - observações
 * - mecânico
 */
export const updateFull = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Não autorizado.' });
  }

  try {
    const id = Number(req.params.id);

    const updatedEstimate = await EstimateService.updateEstimateFull(
      id,
      req.body,
      req.user.userId
    );

    return res.status(200).json(updatedEstimate);
  } catch (error: any) {
    console.error("🔥 Erro ao atualizar orçamento:", error);

    return res.status(500).json({
      message: error.message || 'Erro ao atualizar orçamento.'
    });
  }
};

/**
 * DELETE
 */
export const deleteEstimate = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Não autorizado.' });
  }

  try {
    const id = Number(req.params.id);

    await EstimateService.deleteEstimate(id, req.user.userId);

    return res.status(200).json({
      message: 'Orçamento deletado com sucesso.'
    });
  } catch (error: any) {
    console.error("🔥 Erro ao deletar orçamento:", error);

    return res.status(500).json({
      message: error.message || 'Erro interno do servidor.'
    });
  }
};