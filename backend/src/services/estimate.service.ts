import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createEstimate = async (data: any) => {
  return prisma.estimate.create({
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
};

export const getAllEstimates = async (userId: number) => {
  return prisma.estimate.findMany({
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
};

export const getEstimateById = async (id: number, userId: number) => {
  return prisma.estimate.findFirst({
    where: { id, userId },
    include: {
      vehicle: true,
      parts: true,
      services: true
    }
  });
};

// 🔥 UPDATE COMPLETO (CORE DO SISTEMA)
export const updateEstimateFull = async (id: number, data: any, userId: number) => {
  return prisma.$transaction(async (tx) => {

    const existing = await tx.estimate.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      throw new Error('Orçamento não encontrado.');
    }

    // limpa dados antigos
    await tx.part.deleteMany({ where: { estimateId: id } });
    await tx.service.deleteMany({ where: { estimateId: id } });

    return tx.estimate.update({
      where: { id },
      data: {
        mechanicName: data.mechanicName,
        observations: data.observations,
        status: data.status,
        totalPrice: Number(data.totalPrice),

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
        }
      },
      include: {
        vehicle: true,
        parts: true,
        services: true
      }
    });

  });
};

export const deleteEstimate = async (id: number, userId: number) => {
  const existing = await prisma.estimate.findFirst({
    where: { id, userId }
  });

  if (!existing) {
    throw new Error('Orçamento não encontrado.');
  }

  return prisma.estimate.delete({
    where: { id }
  });
};