import React, { useState } from 'react';

// 1. Props atualizadas para aceitar o token
interface ReportSectionProps {
  token: string | null;
}

interface ReportData {
  id: number;
  totalPrice: number;
  createdAt: string;
  vehicle: {
    plate: string;
    brand: string;
    model: string;
  };
}

const ReportSection: React.FC<ReportSectionProps> = ({ token }) => {
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    setError(null);
    setReportData([]);
    try {
      const finalEndDate = new Date(endDate);
      finalEndDate.setHours(23, 59, 59, 999);

      const url = `/api/report/estimates?startDate=${startDate}&endDate=${finalEndDate.toISOString()}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}` // 2. USA O TOKEN
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar dados do relatório.');
      }
      const data = await response.json();
      setReportData(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="list-container">
      <h2>Relatório de Orçamentos Finalizados</h2>
      <div className="report-form">
        <div className="form-group">
          <label>Data de Início</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Data de Fim</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <button onClick={handleGenerateReport} className="btn-primary">Gerar Relatório</button>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="report-results">
        {reportData.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Orçamento Nº</th>
                <th>Data</th>
                <th>Veículo</th>
                <th>Placa</th>
                <th>Valor Total</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td>{`${item.vehicle.brand} ${item.vehicle.model}`}</td>
                  <td>{item.vehicle.plate}</td>
                  <td>R$ {item.totalPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ReportSection;
