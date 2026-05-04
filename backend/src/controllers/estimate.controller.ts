import { Request, Response } from 'express';
import * as EstimateService from '../services/estimate.service';

// CORREÇÃO: A interface agora reflete o payload completo do token JWT
interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    name: string;
    companyName: string;
  };
}

export const create = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Não autorizado. Token inválido ou ausente.' });
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
    res.status(500).json({ message: 'Erro interno do servidor ao criar orçamento.' });
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const estimates = await EstimateService.getAllEstimates();
    res.status(200).json(estimates);
  } catch (error: any) {
    console.error("Erro ao buscar orçamentos:", error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar orçamentos.' });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const estimate = await EstimateService.getEstimateById(id);
    if (estimate) {
      res.status(200).json(estimate);
    } else {
      res.status(404).json({ message: 'Orçamento não encontrado.' });
    }
  } catch (error: any) {
    console.error("Erro ao buscar orçamento por ID:", error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'O novo status é obrigatório.' });
    }
    
    const updatedEstimate = await EstimateService.updateEstimateStatus(id, status);
    res.status(200).json(updatedEstimate);
  } catch (error: any) {
    console.error("Erro ao atualizar status do orçamento:", error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    await EstimateService.deleteEstimate(id);
    res.status(204).send();
  } catch (error: any) {
    console.error("Erro ao deletar orçamento:", error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};
