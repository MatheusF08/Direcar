// Este arquivo estende a definição de tipos global do Express

// Importa o tipo original para referência, se necessário (opcional)
import { Request } from "express";

declare global {
  namespace Express {
    // Define o payload que esperamos do nosso token JWT
    interface UserPayload {
      userId: number;
      name: string;
      companyName: string;
    }

    // Adiciona a propriedade 'user' ao objeto Request do Express
    interface Request {
      user?: UserPayload;
    }
  }
}
