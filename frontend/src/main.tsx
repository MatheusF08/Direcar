import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// Encontra o elemento 'root' no seu index.html e renderiza a aplicação dentro dele
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
