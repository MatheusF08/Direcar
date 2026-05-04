"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const estimate_routes_1 = __importDefault(require("./routes/estimate.routes"));
const app = (0, express_1.default)();
// --- Configuração de CORS Dinâmica e Segura ---
// 1. Lista de origens permitidas.
//    Em desenvolvimento, permitirá o localhost.
//    Em produção, permitirá a URL do seu frontend na Vercel.
const allowedOrigins = [
    'http://localhost:5173', // Para desenvolvimento local
    process.env.FRONTEND_URL // Para produção (ex: 'https://direcar.vercel.app' )
];
const corsOptions = {
    origin: (origin, callback) => {
        // Se a origem da requisição estiver na nossa lista (ou se for uma requisição sem origem, como de um app mobile ou Postman), permite.
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            // Se a origem não estiver na lista, rejeita a requisição.
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200
};
// 2. Use o middleware do CORS com as opções dinâmicas.
//    Isso deve vir antes de qualquer outra rota.
app.use((0, cors_1.default)(corsOptions));
// Outros middlewares essenciais
app.use(express_1.default.json());
// Registro das Rotas
app.use('/api/auth', auth_routes_1.default);
app.use('/api/estimates', estimate_routes_1.default);
// --- Inicialização do Servidor com Porta Dinâmica ---
// 3. Usa a porta fornecida pelo ambiente de produção (Render) ou 3001 como padrão.
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    // Remove o 'http://localhost:' do log para não confundir em produção.
    console.log(`🚀 Servidor backend robusto rodando na porta ${PORT}`);
});
