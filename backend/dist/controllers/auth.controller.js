"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'seu-segredo-super-secreto-trocar-em-producao';
/**
 * Registra um novo usuário no sistema usando username.
 */
const register = async (req, res) => {
    const { username, password, name } = req.body;
    if (!username || !password || !name) {
        return res.status(400).json({ message: 'Nome de usuário, senha e nome são obrigatórios.' });
    }
    try {
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                name,
            },
        });
        res.status(201).json({ message: 'Usuário registrado com sucesso!', userId: newUser.id });
    }
    catch (error) {
        if (error.code === 'P2002') { // Erro de violação de constraint única (usuário já existe)
            return res.status(409).json({ message: 'Este nome de usuário já está em uso.' });
        }
        console.error("Erro ao registrar usuário:", error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
};
exports.register = register;
/**
 * Autentica um usuário com username e retorna um token JWT.
 */
const login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Nome de usuário e senha são obrigatórios.' });
    }
    try {
        const user = await prisma.user.findUnique({
            where: { username },
        });
        const isPasswordValid = user ? await bcryptjs_1.default.compare(password, user.password) : false;
        if (!user || !isPasswordValid) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, name: user.name }, JWT_SECRET, { expiresIn: '8h' });
        res.status(200).json({ token });
    }
    catch (error) {
        console.error("Erro ao fazer login:", error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
};
exports.login = login;
