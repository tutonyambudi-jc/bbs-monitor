import type { Service, ServiceStatus } from '@prisma/client';
import { prisma } from './prisma';

const DEFAULT_TIMEOUT_MS = 10_000;

export type HealthCheckResult = {
  status: ServiceStatus;
  responseMs: number;
  statusCode: number | null;
  errorMessage: string | null;
};

export async function runHealthCheck(service: Service): Promise<HealthCheckResult> {
  const start = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch(service.healthUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: { Accept: 'application/json, text/plain, */*' },
      cache: 'no-store',
    });
    const responseMs = Date.now() - start;
    let status: ServiceStatus = 'OFFLINE';

    if (res.ok) {
      status = responseMs > service.degradedMs ? 'DEGRADED' : 'ONLINE';
    } else if (res.status >= 500) {
      status = 'OFFLINE';
    } else {
      status = 'DEGRADED';
    }

    return {
      status,
      responseMs,
      statusCode: res.status,
      errorMessage: res.ok ? null : `HTTP ${res.status}`,
    };
  } catch (err) {
    const responseMs = Date.now() - start;
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return {
      status: 'OFFLINE',
      responseMs,
      statusCode: null,
      errorMessage: message,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function persistHealthCheck(serviceId: string, result: HealthCheckResult) {
  const previous = await prisma.service.findUnique({ where: { id: serviceId } });

  await prisma.$transaction([
    prisma.healthCheck.create({
      data: {
        serviceId,
        status: result.status,
        responseMs: result.responseMs,
        statusCode: result.statusCode,
        errorMessage: result.errorMessage,
      },
    }),
    prisma.service.update({
      where: { id: serviceId },
      data: {
        status: result.status,
        lastResponseMs: result.responseMs,
        lastStatusCode: result.statusCode,
        lastError: result.errorMessage,
        lastCheckedAt: new Date(),
      },
    }),
  ]);

  const serviceName = previous?.name ?? serviceId;

  if (previous && previous.status !== result.status && result.status !== 'ONLINE') {
    await prisma.alert.create({
      data: {
        serviceId,
        title: `Service ${serviceName} — ${result.status}`,
        message: result.errorMessage ?? `Statut passé à ${result.status} (${result.responseMs} ms)`,
        severity: result.status === 'OFFLINE' ? 'CRITICAL' : 'WARNING',
        status: 'OPEN',
      },
    });
  }

  if (previous && previous.status !== 'ONLINE' && result.status === 'ONLINE') {
    await prisma.alert.create({
      data: {
        serviceId,
        title: `Service ${serviceName} — rétabli`,
        message: `Le service est de nouveau ONLINE (${result.responseMs} ms)`,
        severity: 'INFO',
        status: 'RESOLVED',
        resolvedAt: new Date(),
      },
    });
  }
}

export async function checkAllEnabledServices() {
  const services = await prisma.service.findMany({ where: { isEnabled: true } });
  const results = [];

  for (const service of services) {
    const result = await runHealthCheck(service);
    await persistHealthCheck(service.id, result);
    results.push({ serviceId: service.id, slug: service.slug, ...result });
  }

  return results;
}
