// frontend/src/components/Login.tsx (Código Corrigido e Final)

import React, { useState } from 'react';
import './Login.css';

interface LoginProps {
  onLoginSuccess: () => void;
  onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onSwitchToRegister }) => {
  // O estado agora armazena 'email'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      // Garante que a URL da API está vindo da variável de ambiente
      const API_URL = import.meta.env.VITE_API_URL;

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // O corpo da requisição agora envia 'email'
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro no login.');
      }

      if (data.token) {
        localStorage.setItem('authToken', data.token);
        onLoginSuccess();
      } else {
        throw new Error('Token não recebido do servidor.');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="login-box">
      <h2>Login do Sistema</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          {/* O label e o input agora são para 'Email' */}
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Senha</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="login-button">Entrar</button>
        <p className="switch-form-text">
          Não tem uma conta? <span onClick={onSwitchToRegister}>Registre-se</span>
        </p>
      </form>
    </div>
  );
};

export default Login;
