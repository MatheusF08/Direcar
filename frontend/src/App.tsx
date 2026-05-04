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
export interface Vehicle { id: number; clientName: string; clientPhone: string; plate: string; brand: string; model: string; year: number; }
export interface Part { id: number; description: string; quantity: number; unitPrice: number; commission: number; }
export interface Service { id: number; description: string; mechanicExecutor: string; price: number; commission: number; }
export interface Estimate { id: number; mechanicName: string; observations: string; totalPrice: number; status: StatusType; createdAt: string; statusUpdatedAt: string; vehicle: Vehicle; parts: Part[]; services: Service[]; }

function App( ) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('authToken'));
  const [showRegister, setShowRegister] = useState<boolean>(false);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [editedEstimate, setEditedEstimate] = useState<Estimate | null>(null);

  const fetchEstimates = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/api/estimates`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!response.ok) throw new Error('Falha ao buscar orçamentos.');
      const data: Estimate[] = await response.json();
      setEstimates(data);
    } catch (error) {
      console.error(error);
      if (error instanceof Error && String(error).includes('401')) handleLogout();
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      setShowRegister(false);
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
    setEditedEstimate(estimate);
  };

  const handleSaveEstimate = async () => {
    const token = localStorage.getItem('authToken');
    if (!token || !editedEstimate) return;
    const updateData = { status: editedEstimate.status };
    try {
      const response = await fetch(`${API_URL}/api/estimates/${editedEstimate.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao salvar as alterações.');
      }
      const savedEstimate: Estimate = await response.json();
      setEstimates(prev => prev.map(est => est.id === savedEstimate.id ? savedEstimate : est));
      setSelectedEstimate(null);
      alert('Orçamento atualizado com sucesso!');
    } catch (err: any) {
      console.error("Erro ao salvar orçamento:", err);
      alert(`Erro: ${err.message}`);
    }
  };

  const handleDeleteEstimate = async (id: number) => {
    if (!window.confirm(`Tem certeza que deseja excluir o orçamento Nº ${String(id).padStart(4, '0')}?`)) return;
    const token = localStorage.getItem('authToken');
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/api/estimates/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Falha ao deletar o orçamento.');
      setEstimates(prev => prev.filter(est => est.id !== id));
      alert('Orçamento deletado com sucesso!');
    } catch (err: any) {
      console.error("Erro ao deletar orçamento:", err);
      alert(`Erro: ${err.message}`);
    }
  };

  const handleGeneratePdf = (estimate: Estimate) => {
    try {
      const doc = new jsPDF();
      const { vehicle, parts, services, totalPrice, mechanicName, observations, id, createdAt } = estimate;
      doc.setFontSize(20); doc.setFont('helvetica', 'bold'); doc.text('DIRECAR', 14, 20); doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.text('Orçamento Automotivo', 14, 26); doc.text(`Orçamento Nº: ${String(id).padStart(4, '0')}`, 140, 20); doc.text(`Data: ${new Date(createdAt).toLocaleDateString('pt-BR')}`, 140, 26); doc.line(14, 30, 196, 30); doc.setFontSize(11); doc.text(`Cliente: ${vehicle.clientName}`, 14, 40); doc.text(`Telefone: ${vehicle.clientPhone}`, 14, 46); doc.text(`Veículo: ${vehicle.brand} ${vehicle.model} ${vehicle.year}`, 14, 52); doc.text(`Placa: ${vehicle.plate}`, 14, 58);
      autoTable(doc, { startY: 65, head: [['Peça', 'Qtd', 'Valor', 'Subtotal']], body: parts.map(p => [p.description, p.quantity, `R$ ${p.unitPrice.toFixed(2)}`, `R$ ${(p.quantity * p.unitPrice).toFixed(2)}`]), theme: 'grid', headStyles: { fillColor: [255, 106, 0] } });
      autoTable(doc, { startY: (doc as any).lastAutoTable.finalY + 5, head: [['Serviço', 'Executor', 'Valor']], body: services.map(s => [s.description, s.mechanicExecutor, `R$ ${s.price.toFixed(2)}`]), theme: 'grid', headStyles: { fillColor: [255, 106, 0] } });
      const finalY = (doc as any).lastAutoTable.finalY;
      doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.text(`TOTAL: R$ ${totalPrice.toFixed(2)}`, 196, finalY + 10, { align: 'right' }); doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.text('Observações:', 14, finalY + 20); doc.text(observations || '-', 14, finalY + 25, { maxWidth: 180 }); doc.text(`Mecânico: ${mechanicName}`, 14, finalY + 40); doc.line(14, finalY + 60, 80, finalY + 60); doc.text('Assinatura do Cliente', 14, finalY + 65); doc.save(`orcamento_${String(id).padStart(4, '0')}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Ocorreu um erro ao tentar gerar o PDF.');
    }
  };

  const renderContent = () => {
    if (isAuthenticated) {
      return (
        <>
          <header className="app-header"><h1>Direcar - Gestão de Orçamentos</h1><button onClick={handleLogout} className="logout-button">Sair</button></header>
          <main>
            <EstimateForm onEstimateCreated={fetchEstimates} />
            <VehicleList estimates={estimates} onDelete={handleDeleteEstimate} onView={handleViewEstimate} onGeneratePdf={handleGeneratePdf} />
          </main>
          {selectedEstimate && editedEstimate && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header"><h2>Editar Orçamento Nº {String(selectedEstimate.id).padStart(4, '0')}</h2><button className="close-button" onClick={() => setSelectedEstimate(null)}>×</button></div>
                <div className="modal-body">
                  <p><strong>Cliente:</strong> {selectedEstimate.vehicle.clientName}</p>
                  <p><strong>Veículo:</strong> {`${selectedEstimate.vehicle.brand} ${selectedEstimate.vehicle.model} (${selectedEstimate.vehicle.plate})`}</p>
                  <p><strong>Status Atual:</strong> {selectedEstimate.status.replace('_', ' ')}</p><hr />
                  <h4>Alterar Status para:</h4>
                  <div className="status-change-buttons">
                    <button className="action-button ag-aprovacao" onClick={() => setEditedEstimate(prev => prev ? { ...prev, status: 'AG_APROVACAO' } : null)}>Ag. Aprovação</button>
                    <button className="action-button aprovado" onClick={() => setEditedEstimate(prev => prev ? { ...prev, status: 'APROVADO' } : null)}>Aprovado</button>
                    <button className="action-button finalizado" onClick={() => setEditedEstimate(prev => prev ? { ...prev, status: 'FINALIZADO' } : null)}>Finalizado</button>
                    <button className="action-button cancelado" onClick={() => setEditedEstimate(prev => prev ? { ...prev, status: 'CANCELADO' } : null)}>Cancelado</button>
                  </div>
                  <p className="new-status-preview"><strong>Novo Status:</strong> {editedEstimate.status.replace('_', ' ')}</p>
                </div>
                <div className="modal-footer">
                  <button className="cancel-button" onClick={() => setSelectedEstimate(null)}>Cancelar</button>
                  <button className="save-button" onClick={handleSaveEstimate}>Salvar Alterações</button>
                </div>
              </div>
            </div>
          )}
        </>
      );
    } else if (showRegister) {
      return <Register onSwitchToLogin={() => setShowRegister(false)} />;
    } else {
      // ✔️ CORREÇÃO APLICADA AQUI
      return <Login onLoginSuccess={handleLoginSuccess} onSwitchToRegister={() => setShowRegister(true)} />;
    }
  };

  return (
    <div className={isAuthenticated ? 'app-container' : 'login-page'}>
      {renderContent()}
    </div>
  );
}

export default App;
