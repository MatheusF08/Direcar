import React from 'react';
import { Estimate } from '../App';
import './EstimateList.css';

interface EstimateListProps {
  estimates: Estimate[];
}

const EstimateList: React.FC<EstimateListProps> = ({ estimates }) => {
  // Verificação de segurança: Se a prop 'estimates' não for um array, retorna nulo para não quebrar.
  if (!Array.isArray(estimates)) {
    console.error("EstimateList recebeu uma prop 'estimates' que não é um array:", estimates);
    return null; 
  }

  return (
    <div className="estimate-list-container">
      <h2>Orçamentos na Oficina</h2>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Orçamento Nº</th>
              <th>Placa</th>
              <th>Veículo</th>
              <th>Cliente</th>
              <th>Data Entrada</th>
              <th>Status</th>
              <th>Valor</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {estimates.length > 0 ? (
              estimates.map((estimate) => (
                <tr key={estimate.id}>
                  <td>{String(estimate.id).padStart(4, '0')}</td>
                  <td>{estimate.vehicle.plate}</td>
                  <td>{`${estimate.vehicle.brand} ${estimate.vehicle.model}`}</td>
                  <td>{estimate.vehicle.clientName}</td>
                  <td>{new Date(estimate.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <span className={`status status-${estimate.status.toLowerCase().replace('_', '-')}`}>
                      {estimate.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{estimate.totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td>
                    <button className="action-button view">Ver</button>
                    <button className="action-button delete">Excluir</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="no-data-cell">Nenhum orçamento encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EstimateList;
