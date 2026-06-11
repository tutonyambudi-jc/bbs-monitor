'use server';

import { revalidatePath } from 'next/cache';
import { getSession, isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { runHealthCheck, persistHealthCheck } from '@/lib/health-check';
import { serviceSchema, type ServiceInput } from '@/lib/validations/service';

async function requireAdmin() {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    throw new Error('Accès refusé');
  }
  return session;
}

export async function listServices() {
  return prisma.service.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { healthChecks: true, alerts: { where: { status: 'OPEN' } } } },
    },
  });
}

export async function getServiceDetail(id: string) {
  return prisma.service.findUnique({
    where: { id },
    include: {
      healthChecks: { orderBy: { checkedAt: 'desc' }, take: 50 },
      alerts: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  });
}

export async function createService(input: ServiceInput) {
  const session = await requireAdmin();
  const data = serviceSchema.parse(input);

  const service = await prisma.service.create({
    data: {
      ...data,
      baseUrl: data.baseUrl || null,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.id,
      action: 'service.create',
      entityType: 'service',
      entityId: service.id,
      metadata: { name: service.name, slug: service.slug },
    },
  });

  revalidatePath('/services');
  revalidatePath('/');
  return service;
}

export async function updateService(id: string, input: ServiceInput) {
  const session = await requireAdmin();
  const data = serviceSchema.parse(input);

  const service = await prisma.service.update({
    where: { id },
    data: {
      ...data,
      baseUrl: data.baseUrl || null,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.id,
      action: 'service.update',
      entityType: 'service',
      entityId: service.id,
      metadata: { name: service.name },
    },
  });

  revalidatePath('/services');
  revalidatePath(`/services/${id}`);
  revalidatePath('/');
  return service;
}

export async function deleteService(id: string) {
  const session = await requireAdmin();
  await prisma.service.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      userId: session.id,
      action: 'service.delete',
      entityType: 'service',
      entityId: id,
    },
  });

  revalidatePath('/services');
  revalidatePath('/');
}

export async function checkServiceNow(id: string) {
  await requireAdmin();
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) throw new Error('Service introuvable');

  const result = await runHealthCheck(service);
  await persistHealthCheck(service.id, result);

  revalidatePath('/services');
  revalidatePath(`/services/${id}`);
  revalidatePath('/');
  revalidatePath('/alerts');
  return result;
}

export async function getDashboardOverview() {
  const [services, openAlerts, latestMetric, recentChecks] = await Promise.all([
    prisma.service.findMany({ orderBy: { name: 'asc' } }),
    prisma.alert.count({ where: { status: 'OPEN' } }),
    prisma.serverMetric.findFirst({ orderBy: { recordedAt: 'desc' } }),
    prisma.healthCheck.findMany({
      orderBy: { checkedAt: 'desc' },
      take: 10,
      include: { service: { select: { name: true, slug: true } } },
    }),
  ]);

  const online = services.filter((s) => s.status === 'ONLINE').length;
  const offline = services.filter((s) => s.status === 'OFFLINE').length;
  const degraded = services.filter((s) => s.status === 'DEGRADED').length;

  return {
    services,
    stats: {
      total: services.length,
      online,
      offline,
      degraded,
      openAlerts,
    },
    latestMetric,
    recentChecks,
  };
}
