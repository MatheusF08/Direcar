import { Request, Response } from 'express';
import * as EstimateService from '../services/estimate.service';

// NÃO precisamos mais da interface AuthenticatedRequest aqui

export const create = async (req: Request, res: Response) => {
  // O TypeScript agora sabe que req.user pode existir e qual é o seu tipo
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

// ... (o resto das funções: getAll, getById, etc. usam 'req: Request' e não precisam de alteração)
export const getAll = async (req: Request, res: Response) => { /* ...código inalterado... */ };
export const getById = async (req: Request, res: Response) => { /* ...código inalterado... */ };
export const updateStatus = async (req: Request, res: Response) => { /* ...código inalterado... */ };
export const remove = async (req: Request, res: Response) => { /* ...código inalterado... */ };
