"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'seu-segredo-super-secreto-trocar-em-producao';
/**
 * Middleware para verificar a validade de um token JWT.
 * Renomeado de volta para 'authenticateToken' para consistência.
 */
// 2. Usamos nosso tipo customizado 'AuthenticatedRequest' para o parâmetro 'req'.
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // 3. Agora o TypeScript sabe que 'req.user' pode existir neste contexto.
        //    O erro TS2339 desaparecerá daqui.
        req.user = {
            userId: decoded.userId,
            name: decoded.name,
        };
        next();
    }
    catch (err) {
        return res.status(403).json({ message: 'Token inválido ou expirado.' });
    }
};
exports.authenticateToken = authenticateToken;
