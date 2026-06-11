'use server';

import { revalidatePath } from 'next/cache';
import { getSession, isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function requireAdmin() {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    throw new Error('Accès refusé');
  }
  return session;
}

export async function listAlerts() {
  return prisma.alert.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      service: { select: { id: true, name: true, slug: true } },
    },
    take: 200,
  });
}

export async function acknowledgeAlert(id: string) {
  await requireAdmin();
  await prisma.alert.update({
    where: { id },
    data: { status: 'ACKNOWLEDGED' },
  });
  revalidatePath('/alerts');
  revalidatePath('/');
}

export async function resolveAlert(id: string) {
  await requireAdmin();
  await prisma.alert.update({
    where: { id },
    data: { status: 'RESOLVED', resolvedAt: new Date() },
  });
  revalidatePath('/alerts');
  revalidatePath('/');
}
