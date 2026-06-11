import os from 'node:os';
import { prisma } from './prisma';

export async function collectServerMetrics() {
  const cpus = os.cpus();
  const load = os.loadavg();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const memoryPercent = totalMem > 0 ? ((totalMem - freeMem) / totalMem) * 100 : 0;

  // Estimation CPU via load average / nb cœurs (conteneur)
  const cpuPercent = Math.min(100, (load[0] / Math.max(cpus.length, 1)) * 100);

  const metric = await prisma.serverMetric.create({
    data: {
      hostname: os.hostname(),
      cpuPercent: Math.round(cpuPercent * 100) / 100,
      memoryPercent: Math.round(memoryPercent * 100) / 100,
      diskPercent: null,
      loadAvg1: load[0],
    },
  });

  return metric;
}
