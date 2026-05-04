import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface RegisterProps {
  onSwitchToLogin: ( ) => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, companyName }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Falha ao registrar.');
      }
      alert('Registro bem-sucedido! Agora você pode fazer o login.');
      onSwitchToLogin();
    } catch (err: any) {
      setError(err.message);
      console.error('Falha no registro:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* TÍTULO ADICIONADO AQUI */}
      <h1 className="login-title">Direcar</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Registro de Nova Oficina</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="input-group"><label htmlFor="companyName">Nome da Oficina</label><input id="companyName" type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required /></div>
        <div className="input-group"><label htmlFor="name">Seu Nome</label><input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required /></div>
        <div className="input-group"><label htmlFor="email">Email</label><input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div className="input-group"><label htmlFor="password">Senha</label><input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
        <button type="submit" disabled={isLoading}>{isLoading ? 'Registrando...' : 'Registrar'}</button>
        <p className="switch-form-text">
          Já tem uma conta?{' '}
          <span onClick={onSwitchToLogin} className="switch-form-link">
            Faça o login
          </span>
        </p>
      </form>
    </div>
  );
};

export default Register;
