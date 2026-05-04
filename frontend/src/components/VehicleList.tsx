import { useState, useMemo } from 'react';
import { Estimate, StatusType } from '../App'; // Importa os tipos do App.tsx
import './VehicleList.css';

// Define as propriedades que o componente espera receber
interface VehicleListProps {
  estimates: Estimate[];
  onDelete: (id: number) => void;
  onView: (estimate: Estimate) => void;
  onGeneratePdf: (estimate: Estimate) => void; // Garante que a prop onGeneratePdf é esperada
}

// Função para calcular os dias na oficina
const calculateDaysInOffice = (dateString: string): number => {
  const entryDate = new Date(dateString);
  const today = new Date();
  const differenceInTime = today.getTime() - entryDate.getTime();
  const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
  return differenceInDays > 0 ? differenceInDays : 1; // Mostra no mínimo 1 dia
};

const VehicleList: React.FC<VehicleListProps> = ({ estimates, onDelete, onView, onGeneratePdf }) => {
  const [activeFilter, setActiveFilter] = useState<StatusType | 'ALL'>('ALL');

  const filteredEstimates = useMemo(() => {
    if (activeFilter === 'ALL') return estimates;
    return estimates.filter(estimate => estimate.status === activeFilter);
  }, [estimates, activeFilter]);

  const statusCounts = useMemo(() => {
    return estimates.reduce((acc, est) => {
      acc[est.status] = (acc[est.status] || 0) + 1;
      return acc;
    }, {} as Record<StatusType, number>);
  }, [estimates]);

  return (
    <div className="vehicle-list-container">
      <div className="status-filters">
        <button onClick={() => setActiveFilter('ALL')} className={activeFilter === 'ALL' ? 'active' : ''}>
          Todos ({estimates.length})
        </button>
        <button onClick={() => setActiveFilter('AG_APROVACAO')} className={activeFilter === 'AG_APROVACAO' ? 'active' : ''}>
          Ag. Aprovação ({statusCounts.AG_APROVACAO || 0})
        </button>
        <button onClick={() => setActiveFilter('APROVADO')} className={activeFilter === 'APROVADO' ? 'active' : ''}>
          Aprovados ({statusCounts.APROVADO || 0})
        </button>
        <button onClick={() => setActiveFilter('FINALIZADO')} className={activeFilter === 'FINALIZADO' ? 'active' : ''}>
          Finalizados ({statusCounts.FINALIZADO || 0})
        </button>
        <button onClick={() => setActiveFilter('CANCELADO')} className={activeFilter === 'CANCELADO' ? 'active' : ''}>
          Cancelados ({statusCounts.CANCELADO || 0})
        </button>
      </div>

      <div className="table-wrapper">
        <table className="estimates-table">
          <thead>
            <tr>
              <th>Orçamento Nº</th>
              <th>Placa</th>
              <th>Veículo</th>
              <th>Cliente</th>
              <th>Dias na Oficina</th>
              <th>Status</th>
              <th>Valor</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredEstimates.length > 0 ? (
              filteredEstimates.map((estimate) => (
                <tr key={estimate.id}>
                  <td>{String(estimate.id).padStart(4, '0')}</td>
                  <td>{estimate.vehicle.plate}</td>
                  <td>{`${estimate.vehicle.brand} ${estimate.vehicle.model} ${estimate.vehicle.year}`}</td>
                  <td>{estimate.vehicle.clientName}</td>
                  <td>{calculateDaysInOffice(estimate.statusUpdatedAt)}</td>
                  <td>
                    <span className={`status status-${estimate.status.toLowerCase().replace('_', '-')}`}>
                      {estimate.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{estimate.totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td>
                    <button className="action-button view" onClick={() => onView(estimate)}>Ver / Editar</button>
                    {/* A CORREÇÃO ESTÁ AQUI: O onClick chama a função onGeneratePdf passada via props */}
                    <button className="action-button pdf" onClick={() => onGeneratePdf(estimate)}>PDF</button>
                    <button className="action-button delete" onClick={() => onDelete(estimate.id)}>Excluir</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="no-data-cell">Nenhum orçamento encontrado para este status.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VehicleList;
