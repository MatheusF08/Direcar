import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// SUA VERSÃO ROBUSTA DA FUNÇÃO: Garante que todos os valores sejam tratados como números.
const calculateTotalPrice = (parts: any[], services: any[]): number => {
  const safeParts = parts ?? [];
  const safeServices = services ?? [];

  const totalPartsPrice = safeParts.reduce((acc, part) => {
    return acc + (Number(part.quantity) || 0) * (Number(part.unitPrice) || 0);
  }, 0);

  const totalServicesPrice = safeServices.reduce((acc, service) => {
    return acc + (Number(service.price) || 0);
  }, 0);

  const partsCommission = safeParts.reduce((acc, part) => {
    return (
      acc +
      (Number(part.quantity) || 0) *
        (Number(part.unitPrice) || 0) *
        ((Number(part.commission) || 0) / 100)
    );
  }, 0);

  const servicesCommission = safeServices.reduce((acc, service) => {
    return (
      acc +
      (Number(service.price) || 0) *
        ((Number(service.commission) || 0) / 100)
    );
  }, 0);

  const total =
    totalPartsPrice +
    totalServicesPrice +
    partsCommission +
    servicesCommission;

  // Retorna o número com duas casas decimais, garantindo que é um número.
  return Number(total.toFixed(2));
};


// Lógica para criar um novo orçamento
export const createEstimate = async (estimateData: any, userId: number) => {
  const { vehicle, parts, services, ...restOfEstimateData } = estimateData;

  // 1. O preço total é calculado com a função robusta.
  const totalPrice = calculateTotalPrice(parts, services);

  // 2. SUA VERIFICAÇÃO DE SEGURANÇA: Garante que o valor é finito antes de prosseguir.
  if (!Number.isFinite(totalPrice)) {
    throw new Error('Cálculo do preço total resultou em um valor inválido: ' + totalPrice);
  }

  // 3. SUA CORREÇÃO APLICADA: Passa o número garantido para o Prisma.
  return await prisma.estimate.create({
    data: {
      ...restOfEstimateData,
      totalPrice: Number(totalPrice), // Força o tipo primitivo para segurança extra.
      user: { connect: { id: userId } },
      vehicle: {
        connectOrCreate: {
          where: { plate: vehicle.plate },
          create: vehicle,
        },
      },
      parts: { create: parts },
      services: { create: services },
    },
    include: {
      vehicle: true,
      parts: true,
      services: true,
      user: { select: { name: true } },
    },
  });
};

// --- O RESTANTE DO ARQUIVO PERMANECE IGUAL ---

export const getAllEstimatesByUserId = async (userId: number) => {
  return await prisma.estimate.findMany({
    where: { userId },
    include: { vehicle: true, parts: true, services: true },
    orderBy: { createdAt: 'desc' },
  });
};

export const getEstimateById = async (id: number) => {
  return await prisma.estimate.findUnique({ where: { id } });
};

export const updateEstimate = async (id: number, data: Prisma.EstimateUpdateInput & { parts?: any[], services?: any[] }) => {
  const { parts, services, status, ...estimateData } = data;
  
  return prisma.$transaction(async (tx) => {
    if (parts) {
      await tx.part.deleteMany({ where: { estimateId: id } });
      await tx.estimate.update({ where: { id }, data: { parts: { create: parts } } });
    }
    if (services) {
      await tx.estimateService.deleteMany({ where: { estimateId: id } });
      await tx.estimate.update({ where: { id }, data: { services: { create: services } } });
    }
    
    const updatedEstimateWithRelations = await tx.estimate.findUnique({
      where: { id },
      include: { parts: true, services: true },
    });

    if (!updatedEstimateWithRelations) {
      throw new Error("Orçamento não encontrado após a atualização.");
    }

    const newTotalPrice = calculateTotalPrice(updatedEstimateWithRelations.parts, updatedEstimateWithRelations.services);

    return tx.estimate.update({
      where: { id },
      data: {
        mechanicName: estimateData.mechanicName as string,
        observations: estimateData.observations as string,
        status: status as string,
        statusUpdatedAt: new Date(),
        totalPrice: newTotalPrice,
      },
      include: {
        vehicle: true,
        parts: true,
        services: true,
        user: { select: { name: true } },
      },
    });
  });
};

export const deleteEstimate = async (id: number) => {
  return await prisma.estimate.delete({ where: { id } });
};
