"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEstimate = exports.updateEstimate = exports.getEstimateById = exports.getAllEstimatesByUserId = exports.createEstimate = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// SUA VERSÃO ROBUSTA DA FUNÇÃO: Garante que todos os valores sejam tratados como números.
const calculateTotalPrice = (parts, services) => {
    const safeParts = parts !== null && parts !== void 0 ? parts : [];
    const safeServices = services !== null && services !== void 0 ? services : [];
    const totalPartsPrice = safeParts.reduce((acc, part) => {
        return acc + (Number(part.quantity) || 0) * (Number(part.unitPrice) || 0);
    }, 0);
    const totalServicesPrice = safeServices.reduce((acc, service) => {
        return acc + (Number(service.price) || 0);
    }, 0);
    const partsCommission = safeParts.reduce((acc, part) => {
        return (acc +
            (Number(part.quantity) || 0) *
                (Number(part.unitPrice) || 0) *
                ((Number(part.commission) || 0) / 100));
    }, 0);
    const servicesCommission = safeServices.reduce((acc, service) => {
        return (acc +
            (Number(service.price) || 0) *
                ((Number(service.commission) || 0) / 100));
    }, 0);
    const total = totalPartsPrice +
        totalServicesPrice +
        partsCommission +
        servicesCommission;
    // Retorna o número com duas casas decimais, garantindo que é um número.
    return Number(total.toFixed(2));
};
// Lógica para criar um novo orçamento
const createEstimate = async (estimateData, userId) => {
    const { vehicle, parts, services } = estimateData, restOfEstimateData = __rest(estimateData, ["vehicle", "parts", "services"]);
    // 1. O preço total é calculado com a função robusta.
    const totalPrice = calculateTotalPrice(parts, services);
    // 2. SUA VERIFICAÇÃO DE SEGURANÇA: Garante que o valor é finito antes de prosseguir.
    if (!Number.isFinite(totalPrice)) {
        throw new Error('Cálculo do preço total resultou em um valor inválido: ' + totalPrice);
    }
    // 3. SUA CORREÇÃO APLICADA: Passa o número garantido para o Prisma.
    return await prisma.estimate.create({
        data: Object.assign(Object.assign({}, restOfEstimateData), { totalPrice: Number(totalPrice), user: { connect: { id: userId } }, vehicle: {
                connectOrCreate: {
                    where: { plate: vehicle.plate },
                    create: vehicle,
                },
            }, parts: { create: parts }, services: { create: services } }),
        include: {
            vehicle: true,
            parts: true,
            services: true,
            user: { select: { name: true } },
        },
    });
};
exports.createEstimate = createEstimate;
// --- O RESTANTE DO ARQUIVO PERMANECE IGUAL ---
const getAllEstimatesByUserId = async (userId) => {
    return await prisma.estimate.findMany({
        where: { userId },
        include: { vehicle: true, parts: true, services: true },
        orderBy: { createdAt: 'desc' },
    });
};
exports.getAllEstimatesByUserId = getAllEstimatesByUserId;
const getEstimateById = async (id) => {
    return await prisma.estimate.findUnique({ where: { id } });
};
exports.getEstimateById = getEstimateById;
const updateEstimate = async (id, data) => {
    const { parts, services, status } = data, estimateData = __rest(data, ["parts", "services", "status"]);
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
                mechanicName: estimateData.mechanicName,
                observations: estimateData.observations,
                status: status,
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
exports.updateEstimate = updateEstimate;
const deleteEstimate = async (id) => {
    return await prisma.estimate.delete({ where: { id } });
};
exports.deleteEstimate = deleteEstimate;
