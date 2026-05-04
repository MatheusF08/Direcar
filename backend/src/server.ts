// backend/src/server.ts (Código Final e Corrigido para Produção)

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import estimateRoutes from './routes/estimate.routes';

const app = express();
const PORT = process.env.PORT || 3001;

// --- Configuração de CORS Dinâmica e Segura ---
const allowedOrigins = [
  'http://localhost:5173', // Sua URL de desenvolvimento local
  'https://direcar.vercel.app'  // SUA URL DE PRODUÇÃO NA VERCEL
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback ) => {
    // Permite requisições sem 'origin' (como apps mobile ou Postman/curl)
    // ou se a origem estiver na nossa lista de permissões.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200
};

// Use o middleware do CORS com as opções dinâmicas
app.use(cors(corsOptions));

// Middlewares essenciais
app.use(express.json());

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/estimates', estimateRoutes);

// Inicialização do Servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend robusto rodando na porta ${PORT}`);
});
