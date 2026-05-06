import { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import EstimateForm from './components/EstimateForm';
import VehicleList from './components/VehicleList';
import './App.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_URL = import.meta.env.VITE_API_URL;

export type StatusType = 'AG_APROVACAO' | 'APROVADO' | 'FINALIZADO' | 'CANCELADO';

export interface Vehicle {
  id: number;
  clientName: string;
  clientPhone: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
}

export interface Part {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  commission: number;
}

export interface Service {
  id: number;
  description: string;
  mechanicExecutor: string;
  price: number;
  commission: number;
}

export interface Estimate {
  id: number;
  mechanicName: string;
  observations: string;
  totalPrice: number;
  status: StatusType;
  createdAt: string;
  vehicle: Vehicle;
  parts: Part[];
  services: Service[];
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('authToken'));
  const [showRegister, setShowRegister] = useState<boolean>(false);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [editedEstimate, setEditedEstimate] = useState<Estimate | null>(null);

  const fetchEstimates = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/estimates`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Erro ao buscar');

      const data = await response.json();
      setEstimates(data);

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchEstimates();
    }
  }, [isAuthenticated]);

  const handleLoginSuccess = () => setIsAuthenticated(true);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setEstimates([]);
  };

  const handleViewEstimate = (estimate: Estimate) => {
    setSelectedEstimate(estimate);
    setEditedEstimate(JSON.parse(JSON.stringify(estimate))); // clone profundo
  };

  // 🔥 UPDATE COMPLETO
  const handleSaveEstimate = async () => {
    const token = localStorage.getItem('authToken');
    if (!token || !editedEstimate) return;

    try {
      const response = await fetch(`${API_URL}/api/estimates/${editedEstimate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editedEstimate),
      });

      if (!response.ok) throw new Error('Erro ao salvar');

      const updated = await response.json();

      setEstimates(prev =>
        prev.map(e => (e.id === updated.id ? updated : e))
      );

      setSelectedEstimate(null);
      alert('Orçamento atualizado com sucesso');

    } catch (err) {
      console.error(err);
      alert('Erro ao salvar');
    }
  };

  const handleDeleteEstimate = async (id: number) => {
    if (!window.confirm('Deseja excluir?')) return;

    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      await fetch(`${API_URL}/api/estimates/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      setEstimates(prev => prev.filter(e => e.id !== id));

    } catch (err) {
      console.error(err);
    }
  };

  const handleGeneratePdf = (estimate: Estimate) => {
    const doc = new jsPDF();

    doc.text('Orçamento', 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [['Peça', 'Qtd', 'Valor']],
      body: estimate.parts.map(p => [
        p.description,
        p.quantity,
        `R$ ${p.unitPrice}`
      ])
    });

    doc.save('orcamento.pdf');
  };

  const renderContent = () => {
    if (isAuthenticated) {
      return (
        <>
          <header className="app-header">
            <h1>Direcar</h1>
            <button onClick={handleLogout}>Sair</button>
          </header>

          <main>
            <EstimateForm onEstimateCreated={fetchEstimates} />

            <VehicleList
              estimates={estimates}
              onDelete={handleDeleteEstimate}
              onView={handleViewEstimate}
              onGeneratePdf={handleGeneratePdf}
            />
          </main>

          {/* 🔥 MODAL COMPLETO DE EDIÇÃO */}
          {selectedEstimate && editedEstimate && (
            <div className="modal-overlay">
              <div className="modal-content">

                <h2>Editar Orçamento #{editedEstimate.id}</h2>

                {/* MECÂNICO */}
                <input
                  value={editedEstimate.mechanicName}
                  onChange={(e) =>
                    setEditedEstimate(prev => prev ? { ...prev, mechanicName: e.target.value } : null)
                  }
                  placeholder="Mecânico responsável"
                />

                {/* OBSERVAÇÃO */}
                <textarea
                  value={editedEstimate.observations}
                  onChange={(e) =>
                    setEditedEstimate(prev => prev ? { ...prev, observations: e.target.value } : null)
                  }
                  placeholder="Observações"
                />

                {/* STATUS */}
                <select
                  value={editedEstimate.status}
                  onChange={(e) =>
                    setEditedEstimate(prev => prev ? { ...prev, status: e.target.value as StatusType } : null)
                  }
                >
                  <option value="AG_APROVACAO">Ag. Aprovação</option>
                  <option value="APROVADO">Aprovado</option>
                  <option value="FINALIZADO">Finalizado</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>

                {/* PEÇAS */}
                <h3>Peças</h3>
                {editedEstimate.parts.map((p, i) => (
                  <div key={i}>
                    <input value={p.description}
                      onChange={(e) => {
                        const newParts = [...editedEstimate.parts];
                        newParts[i].description = e.target.value;
                        setEditedEstimate({ ...editedEstimate, parts: newParts });
                      }}
                    />
                    <button onClick={() => {
                      const newParts = editedEstimate.parts.filter((_, index) => index !== i);
                      setEditedEstimate({ ...editedEstimate, parts: newParts });
                    }}>
                      X
                    </button>
                  </div>
                ))}

                <button onClick={() =>
                  setEditedEstimate({
                    ...editedEstimate,
                    parts: [...editedEstimate.parts, { id: 0, description: '', quantity: 1, unitPrice: 0, commission: 0 }]
                  })
                }>
                  + Peça
                </button>

                {/* SERVIÇOS */}
                <h3>Serviços</h3>
                {editedEstimate.services.map((s, i) => (
                  <div key={i}>
                    <input value={s.description}
                      onChange={(e) => {
                        const newServices = [...editedEstimate.services];
                        newServices[i].description = e.target.value;
                        setEditedEstimate({ ...editedEstimate, services: newServices });
                      }}
                    />
                    <button onClick={() => {
                      const newServices = editedEstimate.services.filter((_, index) => index !== i);
                      setEditedEstimate({ ...editedEstimate, services: newServices });
                    }}>
                      X
                    </button>
                  </div>
                ))}

                <button onClick={() =>
                  setEditedEstimate({
                    ...editedEstimate,
                    services: [...editedEstimate.services, { id: 0, description: '', mechanicExecutor: '', price: 0, commission: 0 }]
                  })
                }>
                  + Serviço
                </button>

                <br /><br />

                <button onClick={() => setSelectedEstimate(null)}>Cancelar</button>
                <button onClick={handleSaveEstimate}>Salvar</button>

              </div>
            </div>
          )}
        </>
      );
    }

    if (showRegister) {
      return <Register onSwitchToLogin={() => setShowRegister(false)} />;
    }

    return <Login onLoginSuccess={handleLoginSuccess} onSwitchToRegister={() => setShowRegister(true)} />;
  };

  return (
    <div className={isAuthenticated ? 'app-container' : 'login-page'}>
      {renderContent()}
    </div>
  );
}

export default App;