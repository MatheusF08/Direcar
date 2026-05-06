import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createEstimate = async (data: any) => {
  try {
    return await prisma.estimate.create({
      data: {
        mechanicName: data.mechanicName,
        observations: data.observations || null,
        totalPrice: Number(data.totalPrice),
        userId: data.userId,

        vehicle: {
          create: {
            clientName: data.vehicle.clientName,
            clientPhone: data.vehicle.clientPhone,
            plate: data.vehicle.plate,
            brand: data.vehicle.brand,
            model: data.vehicle.model,
            year: Number(data.vehicle.year),
          }
        },

        parts: {
          create: (data.parts || []).map((p: any) => ({
            description: p.description,
            quantity: Number(p.quantity),
            unitPrice: Number(p.unitPrice),
            commission: Number(p.commission),
          }))
        },

        services: {
          create: (data.services || []).map((s: any) => ({
            description: s.description,
            mechanicExecutor: s.mechanicExecutor,
            price: Number(s.price),
            commission: Number(s.commission),
          }))
        },
      },
      include: {
        vehicle: true,
        parts: true,
        services: true
      }
    });

  } catch (error) {
    console.error("🔥 ERRO REAL NO PRISMA (CREATE):", error);
    throw error; // importante para não mascarar erro
  }
};

export const getAllEstimates = async (userId: number) => {
  try {
    return await prisma.estimate.findMany({
      where: { userId },
      include: {
        vehicle: true,
        parts: true,
        services: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  } catch (error) {
    console.error("🔥 ERRO AO BUSCAR ESTIMATES:", error);
    throw error;
  }
};

export const getEstimateById = async (id: number, userId: number) => {
  try {
    return await prisma.estimate.findFirst({
      where: {
        id,
        userId
      },
      include: {
        vehicle: true,
        parts: true,
        services: true
      }
    });
  } catch (error) {
    console.error("🔥 ERRO AO BUSCAR POR ID:", error);
    throw error;
  }
};

export const updateEstimateStatus = async (id: number, status: string, userId: number) => {
  try {
    // 🔒 garante que só atualiza se pertence ao usuário
    const estimate = await prisma.estimate.findFirst({
      where: { id, userId }
    });

    if (!estimate) {
      throw new Error('Orçamento não encontrado ou não pertence ao usuário.');
    }

    return await prisma.estimate.update({
      where: { id },
      data: { status }
    });

  } catch (error) {
    console.error("🔥 ERRO AO ATUALIZAR STATUS:", error);
    throw error;
  }
};

export const deleteEstimate = async (id: number, userId: number) => {
  try {
    // 🔒 valida dono
    const estimate = await prisma.estimate.findFirst({
      where: { id, userId }
    });

    if (!estimate) {
      throw new Error('Orçamento não encontrado ou não pertence ao usuário.');
    }

    return await prisma.estimate.delete({
      where: { id }
    });

  } catch (error) {
    console.error("🔥 ERRO AO DELETAR:", error);
    throw error;
  }
};