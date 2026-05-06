import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createEstimate = async (data: any) => {
  return prisma.estimate.create({
    data: {
      mechanicName: data.mechanicName,
      observations: data.observations,
      totalPrice: data.totalPrice,
      userId: data.userId,

      vehicle: {
        create: data.vehicle
      },

      parts: data.parts?.length
        ? { create: data.parts }
        : undefined,

      services: data.services?.length
        ? { create: data.services }
        : undefined,
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
    where: {
      userId: userId
    },
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
    where: {
      id: id,
      userId: userId
    },
    include: {
      vehicle: true,
      parts: true,
      services: true
    }
  });
};

export const updateEstimateStatus = async (id: number, status: string, userId: number) => {
  return prisma.estimate.update({
    where: { id },
    data: { status },
  });
};

export const deleteEstimate = async (id: number, userId: number) => {
  return prisma.estimate.delete({
    where: { id }
  });
};