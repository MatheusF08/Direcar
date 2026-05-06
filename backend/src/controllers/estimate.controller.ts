import { Request, Response } from 'express';
import * as EstimateService from '../services/estimate.service';

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
    res.status(201).json(newEstimate);
  } catch (error: any) {
    console.error("Erro ao criar orçamento:", error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

export const getAll = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Não autorizado.' });
  }

  try {
    const estimates = await EstimateService.getAllEstimates(req.user.userId);
    res.json(estimates);
  } catch (error) {
    console.error("Erro ao buscar orçamentos:", error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

export const getById = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Não autorizado.' });
  }

  try {
    const id = Number(req.params.id);
    const estimate = await EstimateService.getEstimateById(id, req.user.userId);

    if (!estimate) {
      return res.status(404).json({ message: 'Orçamento não encontrado.' });
    }

    res.json(estimate);
  } catch (error) {
    console.error("Erro ao buscar orçamento:", error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Não autorizado.' });
  }

  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    const updated = await EstimateService.updateEstimateStatus(id, status, req.user.userId);
    res.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

export const remove = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Não autorizado.' });
  }

  try {
    const id = Number(req.params.id);

    await EstimateService.deleteEstimate(id, req.user.userId);
    res.json({ message: 'Orçamento deletado com sucesso.' });
  } catch (error) {
    console.error("Erro ao deletar orçamento:", error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};