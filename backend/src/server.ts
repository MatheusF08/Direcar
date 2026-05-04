// backend/src/server.ts - VERSÃO FINAL E CORRIGIDA

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import estimateRoutes from './routes/estimate.routes';

const app = express();
const PORT = process.env.PORT || 3001;

// 1. Middleware de CORS: Permite que o frontend se comunique com o backend.
app.use(cors());

// 2. Middleware de JSON: ESSENCIAL! Traduz o corpo (body) das requisições de JSON para um objeto que o Express pode usar.
// Esta é a linha que estava faltando ou no lugar errado.
app.use(express.json());

// 3. Rotas da API: Agora que o Express entende JSON, ele pode passar os dados para as rotas.
app.use('/api/auth', authRoutes);
app.use('/api/estimates', estimateRoutes);

// 4. Inicialização do Servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend robusto e pronto para receber JSON na porta ${PORT}`);
});
