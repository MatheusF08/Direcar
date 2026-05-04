// Este arquivo estende os tipos de bibliotecas de terceiros para o projeto inteiro.

declare namespace Express {
  export interface Request {
    /**
     * Adicionamos a propriedade 'user' ao objeto Request.
     * Ela é opcional ('?') para não quebrar rotas que não são protegidas.
     * O payload DEVE corresponder exatamente ao que foi colocado no token JWT.
     */
    user?: {
      userId: number; // <-- DEVE ser 'userId' com 'I' maiúsculo
      name: string;
    };
  }
}
