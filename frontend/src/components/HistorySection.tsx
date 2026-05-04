import React, { useState } from 'react';

// 1. Props atualizadas para aceitar o token
interface HistorySectionProps {
  token: string | null;
}

interface ServiceHistoryData {
  id: number;
  description: string;
  mechanicExecutor: string;
  price: number;
  estimate: {
    id: number;
    createdAt: string;
    vehicle: {
      plate: string;
      brand: string;
      model: string;
    };
  };
}

const HistorySection: React.FC<HistorySectionProps> = ({ token }) => {
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [historyData, setHistoryData] = useState<ServiceHistoryData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateHistory = async () => {
    setError(null);
    setHistoryData([]);
    try {
      const finalEndDate = new Date(endDate);
      finalEndDate.setHours(23, 59, 59, 999);

      const url = `/api/report/services-history?startDate=${startDate}&endDate=${finalEndDate.toISOString()}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}` // 2. USA O TOKEN
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar histórico de serviços.');
      }
      const data = await response.json();
      setHistoryData(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="list-container">
      <h2>Histórico de Serviços Realizados</h2>
      <div className="history-form">
        <div className="form-group">
          <label>Data de Início</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Data de Fim</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <button onClick={handleGenerateHistory} className="btn-primary">Gerar Histórico</button>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="history-results">
        {historyData.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Orçamento Nº</th>
                <th>Veículo</th>
                <th>Serviço</th>
                <th>Executor</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {historyData.map((item) => (
                <tr key={item.id}>
                  <td>{new Date(item.estimate.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td>{item.estimate.id}</td>
                  <td>{`${item.estimate.vehicle.brand} ${item.estimate.vehicle.model} (${item.estimate.vehicle.plate})`}</td>
                  <td>{item.description}</td>
                  <td>{item.mechanicExecutor}</td>
                  <td>R$ {item.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default HistorySection;
