import { useState, useMemo } from 'react';
import './EstimateForm.css';

interface EstimateFormProps {
  onEstimateCreated: () => void;
}

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

const EstimateForm: React.FC<EstimateFormProps> = ({ onEstimateCreated }) => {
  const [vehicle, setVehicle] = useState<VehicleData>({
    clientName: '',
    clientPhone: '',
    plate: '',
    brand: '',
    model: '',
    year: ''
  });

  const [parts, setParts] = useState<PartData[]>([]);
  const [services, setServices] = useState<ServiceData[]>([]);
  const [mechanicName, setMechanicName] = useState('');
  const [observations, setObservations] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleVehicleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVehicle(prev => ({
      ...prev,
      [name]: name === 'year' ? Number(value) || '' : value
    }));
  };

  const addPart = () =>
    setParts([...parts, { description: '', quantity: 1, unitPrice: 0, commission: 10 }]);

  const removePart = (index: number) =>
    setParts(parts.filter((_, i) => i !== index));

  const handlePartChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newParts = [...parts];
    (newParts[index] as any)[name] =
      name === 'description' ? value : Number(value);
    setParts(newParts);
  };

  const addService = () =>
    setServices([...services, { description: '', mechanicExecutor: '', price: 0, commission: 10 }]);

  const removeService = (index: number) =>
    setServices(services.filter((_, i) => i !== index));

  const handleServiceChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newServices = [...services];
    (newServices[index] as any)[name] =
      ['description', 'mechanicExecutor'].includes(name)
        ? value
        : Number(value);
    setServices(newServices);
  };

  const { totalBudget, totalCommissions } = useMemo(() => {
    const totalPartsPrice = parts.reduce((acc, part) => acc + (part.quantity * part.unitPrice), 0);
    const totalServicesPrice = services.reduce((acc, service) => acc + service.price, 0);

    const partsCommission = parts.reduce((acc, part) =>
      acc + (part.quantity * part.unitPrice * (part.commission / 100)), 0);

    const servicesCommission = services.reduce((acc, service) =>
      acc + service.price * (service.commission / 100), 0);

    return {
      totalBudget: totalPartsPrice + totalServicesPrice,
      totalCommissions: partsCommission + servicesCommission
    };
  }, [parts, services]);

  const handleFinalizeEstimate = async () => {
    setError(null);

    const token = localStorage.getItem('authToken');
    if (!token) {
      setError("Sessão expirada. Faça login novamente.");
      return;
    }

    // 🔒 VALIDAÇÃO
    if (!vehicle.clientName || !vehicle.plate || !vehicle.brand || !vehicle.model) {
      setError("Preencha todos os dados obrigatórios do veículo.");
      return;
    }

    if (!vehicle.year || Number(vehicle.year) < 1900) {
      setError("Ano do veículo inválido.");
      return;
    }

    const estimatePayload = {
      vehicle: {
        clientName: vehicle.clientName.trim(),
        clientPhone: vehicle.clientPhone?.trim() || '',
        plate: vehicle.plate.trim(),
        brand: vehicle.brand.trim(),
        model: vehicle.model.trim(),
        year: Number(vehicle.year),
      },

      parts: parts
        .filter(p => p.description && p.quantity > 0)
        .map(p => ({
          description: p.description.trim(),
          quantity: Number(p.quantity),
          unitPrice: Number(p.unitPrice),
          commission: Number(p.commission),
        })),

      services: services
        .filter(s => s.description && s.price > 0)
        .map(s => ({
          description: s.description.trim(),
          mechanicExecutor: s.mechanicExecutor?.trim() || '',
          price: Number(s.price),
          commission: Number(s.commission),
        })),

      mechanicName: mechanicName?.trim() || "Não informado",
      observations: observations?.trim() || '',
      totalPrice: Number(totalBudget) || 0,
    };

    console.log("Payload enviado:", estimatePayload);

    try {
      const API_URL = import.meta.env.VITE_API_URL;

      const response = await fetch(`${API_URL}/api/estimates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(estimatePayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao salvar.');
      }

      alert('Orçamento salvo com sucesso!');
      onEstimateCreated();

      setVehicle({ clientName: '', clientPhone: '', plate: '', brand: '', model: '', year: '' });
      setParts([]);
      setServices([]);
      setMechanicName('');
      setObservations('');

    } catch (err: any) {
      console.error("Erro ao salvar:", err);
      setError(err.message);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Novo Orçamento</h2>

      <div className="form-section">
        <h3 className="section-title">Dados do Veículo</h3>
        <div className="grid-inputs">
          <input name="clientName" value={vehicle.clientName} onChange={handleVehicleChange} placeholder="Nome do Cliente" />
          <input name="clientPhone" value={vehicle.clientPhone} onChange={handleVehicleChange} placeholder="Telefone" />
          <input name="plate" value={vehicle.plate} onChange={handleVehicleChange} placeholder="Placa do veículo" />
          <input name="brand" value={vehicle.brand} onChange={handleVehicleChange} placeholder="Marca (Ex: Fiat)" />
          <input name="model" value={vehicle.model} onChange={handleVehicleChange} placeholder="Modelo (Ex: Palio)" />
          <input name="year" type="number" value={vehicle.year} onChange={handleVehicleChange} placeholder="Ano (Ex: 2009)" />
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">Peças e Serviços</h3>

        <h4>Peças</h4>
        <table className="items-table">
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Qtd.</th>
              <th>Preço Unit.</th>
              <th>Subtotal</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {parts.map((part, index) => (
              <tr key={index}>
                <td><input name="description" value={part.description} onChange={(e) => handlePartChange(index, e)} placeholder="Ex: Óleo" /></td>
                <td><input name="quantity" type="number" value={part.quantity} onChange={(e) => handlePartChange(index, e)} /></td>
                <td><input name="unitPrice" type="number" value={part.unitPrice} onChange={(e) => handlePartChange(index, e)} /></td>
                <td>{(part.quantity * part.unitPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td><button onClick={() => removePart(index)}>X</button></td>
              </tr>
            ))}
          </tbody>
        </table>

        <button onClick={addPart}>+ Adicionar Peça</button>

        <h4 style={{ marginTop: '1.5rem' }}>Mão de Obra</h4>

        <table className="items-table">
          <tbody>
            {services.map((service, index) => (
              <tr key={index}>
                <td><input name="description" value={service.description} onChange={(e) => handleServiceChange(index, e)} placeholder="Ex: Troca de óleo" /></td>
                <td><input name="mechanicExecutor" value={service.mechanicExecutor} onChange={(e) => handleServiceChange(index, e)} placeholder="Executor" /></td>
                <td><input name="price" type="number" value={service.price} onChange={(e) => handleServiceChange(index, e)} /></td>
                <td><input name="commission" type="number" value={service.commission} onChange={(e) => handleServiceChange(index, e)} /></td>
                <td><button onClick={() => removeService(index)}>X</button></td>
              </tr>
            ))}
          </tbody>
        </table>

        <button onClick={addService}>+ Adicionar Serviço</button>
      </div>

      <div className="form-summary">
        <p><strong>Total:</strong> {totalBudget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        <p><strong>Comissões:</strong> {totalCommissions.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
      </div>

      {error && <p className="form-error-message">{error}</p>}

      <div className="form-actions">
        <button onClick={() => window.location.reload()}>Cancelar</button>
        <button onClick={handleFinalizeEstimate}>Salvar Orçamento</button>
      </div>
    </div>
  );
};

export default EstimateForm;