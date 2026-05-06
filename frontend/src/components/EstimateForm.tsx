import { useState, useMemo } from 'react';
import './EstimateForm.css';

// 1. DEFINIÇÃO DAS PROPS: Diz ao TypeScript que este componente espera receber uma função.
interface EstimateFormProps {
  onEstimateCreated: () => void;
}

// Tipos para os dados do formulário
interface VehicleData {
  clientName: string;
  clientPhone: string;
  plate: string;
  brand: string;
  model: string;
  year: number | string;
}

interface PartData {
  description: string;
  quantity: number;
  unitPrice: number;
  commission: number;
}

interface ServiceData {
  description: string;
  mechanicExecutor: string;
  price: number;
  commission: number;
}

// 2. RECEBENDO A PROP: O componente agora recebe 'onEstimateCreated' como um argumento.
const EstimateForm: React.FC<EstimateFormProps> = ({ onEstimateCreated }) => {
  // --- Estados do formulário ---
  const [vehicle, setVehicle] = useState<VehicleData>({ clientName: '', clientPhone: '', plate: '', brand: '', model: '', year: '' });
  const [parts, setParts] = useState<PartData[]>([]);
  const [services, setServices] = useState<ServiceData[]>([]);
  const [mechanicName, setMechanicName] = useState('');
  const [observations, setObservations] = useState('');
  const [error, setError] = useState<string | null>(null);

  // --- Funções de manipulação do formulário ---
  const handleVehicleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVehicle(prev => ({ ...prev, [name]: name === 'year' ? Number(value) || '' : value }));
  };

  const addPart = () => setParts([...parts, { description: '', quantity: 1, unitPrice: 0, commission: 10 }]);
  const removePart = (index: number) => setParts(parts.filter((_, i) => i !== index));
  const handlePartChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newParts = [...parts];
    (newParts[index] as any)[name] = name === 'description' ? value : Number(value);
    setParts(newParts);
  };

  const addService = () => setServices([...services, { description: '', mechanicExecutor: '', price: 0, commission: 10 }]);
  const removeService = (index: number) => setServices(services.filter((_, i) => i !== index));
  const handleServiceChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newServices = [...services];
    (newServices[index] as any)[name] = ['description', 'mechanicExecutor'].includes(name) ? value : Number(value);
    setServices(newServices);
  };

  // --- Cálculos de totais ---
  const { totalBudget, totalCommissions } = useMemo(() => {
    const totalPartsPrice = parts.reduce((acc, part) => acc + (part.quantity * part.unitPrice), 0);
    const totalServicesPrice = services.reduce((acc, service) => acc + service.price, 0);
    const partsCommission = parts.reduce((acc, part) => acc + (part.quantity * part.unitPrice * (part.commission / 100)), 0);
    const servicesCommission = services.reduce((acc, service) => acc + service.price * (service.commission / 100), 0);
    const totalCommissions = partsCommission + servicesCommission;
    const totalBudget = totalPartsPrice + totalServicesPrice; // Total sem comissão para o cliente
    return { totalBudget, totalCommissions };
  }, [parts, services]);

  // --- Função para finalizar e salvar o orçamento ---
  const handleFinalizeEstimate = async () => {
    setError(null);
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError("Sessão expirada. Por favor, faça o login novamente.");
      return;
    }

    const estimatePayload = {
      vehicle,
      parts,
      services,
      mechanicName,
      observations,
      totalPrice: totalBudget,
    };

    try {
      const API_URL = import.meta.env.VITE_API_URL;

      const response = await fetch(`${API_URL}/api/estimates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(estimatePayload ),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro desconhecido ao salvar.');
      }

      alert('Orçamento salvo com sucesso!');
      // 3. CHAMANDO A FUNÇÃO: Após o sucesso, chama a função recebida para atualizar a lista no App.tsx.
      onEstimateCreated();
      // Limpa o formulário para um novo orçamento
      setVehicle({ clientName: '', clientPhone: '', plate: '', brand: '', model: '', year: '' });
      setParts([]);
      setServices([]);
      setMechanicName('');
      setObservations('');

    } catch (err: any) {
      setError(err.message);
      console.error("Erro ao salvar:", err);
    }
  };

  // --- Renderização do JSX ---
  return (
    <div className="form-container">
      <h2 className="form-title">Novo Orçamento</h2>
      
      {/* Seção de Dados do Veículo */}
      <div className="form-section">
        <h3 className="section-title">Dados do Veículo</h3>
        <div className="grid-inputs">
          <input name="clientName" value={vehicle.clientName} onChange={handleVehicleChange} placeholder="Nome do Cliente" />
          <input name="clientPhone" value={vehicle.clientPhone} onChange={handleVehicleChange} placeholder="Telefone" />
          <input name="plate" value={vehicle.plate} onChange={handleVehicleChange} placeholder="Placa" />
          <input name="brand" value={vehicle.brand} onChange={handleVehicleChange} placeholder="Marca" />
          <input name="model" value={vehicle.model} onChange={handleVehicleChange} placeholder="Modelo" />
          <input name="year" type="number" value={vehicle.year} onChange={handleVehicleChange} placeholder="Ano" />
        </div>
      </div>

      {/* Seção de Peças e Serviços */}
      <div className="form-section">
        <h3 className="section-title">Peças e Serviços</h3>
        {/* Tabela de Peças */}
        <h4>Peças</h4>
        <table className="items-table">
          <thead><tr><th>Descrição</th><th>Qtd.</th><th>Preço Unit. (R$)</th><th>Subtotal (R$)</th><th>Ação</th></tr></thead>
          <tbody>
            {parts.map((part, index) => (
              <tr key={index}>
                <td><input name="description" value={part.description} onChange={(e) => handlePartChange(index, e)} /></td>
                <td><input name="quantity" type="number" value={part.quantity} onChange={(e) => handlePartChange(index, e)} /></td>
                <td><input name="unitPrice" type="number" value={part.unitPrice} onChange={(e) => handlePartChange(index, e)} /></td>
                <td>{(part.quantity * part.unitPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td><button className="remove-item-btn" onClick={() => removePart(index)}>X</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="add-item-btn" onClick={addPart}>+ Adicionar Peça</button>

        {/* Tabela de Mão de Obra */}
        <h4 style={{ marginTop: '1.5rem' }}>Mão de Obra</h4>
        <table className="items-table">
          <thead><tr><th>Descrição</th><th>Executor</th><th>Preço (R$)</th><th>Comissão (%)</th><th>Ação</th></tr></thead>
          <tbody>
            {services.map((service, index) => (
              <tr key={index}>
                <td><input name="description" value={service.description} onChange={(e) => handleServiceChange(index, e)} /></td>
                <td><input name="mechanicExecutor" value={service.mechanicExecutor} onChange={(e) => handleServiceChange(index, e)} /></td>
                <td><input name="price" type="number" value={service.price} onChange={(e) => handleServiceChange(index, e)} /></td>
                <td><input name="commission" type="number" value={service.commission} onChange={(e) => handleServiceChange(index, e)} /></td>
                <td><button className="remove-item-btn" onClick={() => removeService(index)}>X</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="add-item-btn" onClick={addService}>+ Adicionar Serviço</button>
      </div>

      {/* Seção de Detalhes Finais */}
      <div className="form-section">
        <h3 className="section-title">Detalhes Finais</h3>
        <div className="grid-inputs">
          <input value={mechanicName} onChange={(e) => setMechanicName(e.target.value)} placeholder="Mecânico Responsável" />
          <input value={observations} onChange={(e) => setObservations(e.target.value)} placeholder="Observações" />
        </div>
      </div>

      {/* Totais e Ações */}
      <div className="form-summary">
        <p><strong>Total do Orçamento:</strong> {totalBudget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        <p><strong>Total de Comissões:</strong> {totalCommissions.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
      </div>
      
      {error && <p className="form-error-message">{error}</p>}
      <div className="form-actions">
        <button type="button" className="cancel-button" onClick={() => window.location.reload()}>Cancelar</button>
        <button type="button" className="finalize-button" onClick={handleFinalizeEstimate}>Salvar Orçamento</button>
      </div>
    </div>
  );
};

export default EstimateForm;
