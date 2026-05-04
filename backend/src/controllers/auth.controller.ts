import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'seu-segredo-super-secreto-trocar-em-producao';

export const register = async (req: Request, res: Response) => {
  const { companyName, name, email, password } = req.body;

  if (!companyName || !name || !email || !password) {
    return res.status(400).json({ message: 'Nome da empresa, nome, email e senha são obrigatórios.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        companyName,
        name,
        email,
        password: hashedPassword,
      },
    });
    
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ message: 'Usuário registrado com sucesso!', user: userWithoutPassword });

  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Este email já está em uso.' });
    }
    console.error("Erro ao registrar usuário:", error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    const isPasswordValid = user ? await bcrypt.compare(password, user.password) : false;

    if (!user || !isPasswordValid) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(
      { userId: user.id, name: user.name, companyName: user.companyName },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
