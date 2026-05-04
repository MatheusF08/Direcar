import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ... (as interfaces VehicleData, PartData, ServiceData permanecem as mesmas)

interface VehicleData {
  clientName: string; clientPhone: string; plate: string; brand: string; model: string; year: number;
}
interface PartData {
  description: string; quantity: number; unitPrice: number; commission: number;
}
interface ServiceData {
  description: string; mechanicExecutor: string; price: number; commission: number;
}
interface EstimateData {
  mechanicName: string; observations?: string; userId: number; vehicle: VehicleData; parts: PartData[]; services: ServiceData[];
}

export const createEstimate = async (data: EstimateData) => {
  const { mechanicName, observations, userId, vehicle, parts, services } = data;

  const totalPartsPrice = parts.reduce((sum, part) => sum + part.quantity * part.unitPrice, 0);
  const totalServicesPrice = services.reduce((sum, service) => sum + service.price, 0);
  const totalPrice = totalPartsPrice + totalServicesPrice;

  // 💥 SOLUÇÃO CORRETA APLICADA (SUA RECOMENDAÇÃO)
  // Trocamos 'userId: userId' por 'user: { connect: { id: userId } }'
  // Isso força o Prisma a usar o tipo 'EstimateCreateInput' relacional.
  const newEstimate = await prisma.estimate.create({
    data: {
      mechanicName,
      observations,
      totalPrice,
      user: { // <-- CORREÇÃO AQUI
        connect: { id: userId },
      },
      vehicle: {
        create: vehicle,
      },
      parts: {
        create: parts,
      },
      services: {
        create: services,
      },
    },
    include: {
      vehicle: true,
      parts: true,
      services: true,
    },
  });

  return newEstimate;
};

// ... (o resto do arquivo: getAllEstimates, getEstimateById, etc. permanece o mesmo)

export const getAllEstimates = async () => {
  return await prisma.estimate.findMany({
    include: { vehicle: true, parts: true, services: true },
    orderBy: { createdAt: 'desc' },
  });
};

export const getEstimateById = async (id: number) => {
  return await prisma.estimate.findUnique({
    where: { id },
    include: { vehicle: true, parts: true, services: true },
  });
};

export const updateEstimateStatus = async (id: number, status: string) => {
  return await prisma.estimate.update({
    where: { id },
    data: { status },
    include: { vehicle: true, parts: true, services: true },
  });
};

export const deleteEstimate = async (id: number) => {
  return await prisma.estimate.delete({ where: { id } });
};
