import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'seu-segredo-super-secreto-trocar-em-producao';

// --- SOLUÇÃO INGNORÁVEL ---
// 1. Definimos uma interface local que estende a Request padrão do Express
//    e adiciona nossa propriedade 'user'.
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    name: string;
  };
}

/**
 * Middleware para verificar a validade de um token JWT.
 * Renomeado de volta para 'authenticateToken' para consistência.
 */
// 2. Usamos nosso tipo customizado 'AuthenticatedRequest' para o parâmetro 'req'.
export const authenticateToken = (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // 3. Agora o TypeScript sabe que 'req.user' pode existir neste contexto.
    //    O erro TS2339 desaparecerá daqui.
    req.user = {
      userId: decoded.userId,
      name: decoded.name,
    };

    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token inválido ou expirado.' });
  }
};
