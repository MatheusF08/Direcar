import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'seu-segredo-super-secreto-trocar-em-producao';

// NÃO precisamos mais da interface AuthenticatedRequest aqui

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido ou expirado.' });
    }
    
    // Anexa o payload decodificado ao req.user. O TypeScript agora entende isso.
    req.user = user as Express.UserPayload;
    
    next();
  });
};
