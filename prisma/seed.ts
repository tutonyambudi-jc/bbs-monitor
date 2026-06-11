import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_SERVICES = [
  {
    name: 'ERP BBS',
    slug: 'erp-bbs',
    category: 'ERP_BBS' as const,
    description: 'ERP comptable Bill BBS',
    baseUrl: 'http://127.0.0.1:3000',
    healthUrl: 'http://127.0.0.1:3000/api/core/health',
  },
  {
    name: 'Travelia ERP',
    slug: 'travelia-erp',
    category: 'TRAVELIA_ERP' as const,
    description: 'Back-office transport Travelia',
    baseUrl: 'http://127.0.0.1:3002',
    healthUrl: 'http://127.0.0.1:3002/api/health',
  },
  {
    name: 'Travelia API',
    slug: 'travelia-api',
    category: 'TRAVELIA_API' as const,
    description: 'API métier Travelia',
    baseUrl: 'http://127.0.0.1:3001',
    healthUrl: 'http://127.0.0.1:3001/api/health',
  },
  {
    name: 'Travelia Web',
    slug: 'travelia-web',
    category: 'TRAVELIA_WEB' as const,
    description: 'Portail web client Travelia',
    baseUrl: 'http://127.0.0.1:5173',
    healthUrl: 'http://127.0.0.1:5173',
  },
  {
    name: 'Echo Challenge',
    slug: 'echo-challenge',
    category: 'ECHO_CHALLENGE' as const,
    description: 'Application Echo Challenge',
    baseUrl: 'http://127.0.0.1:4000',
    healthUrl: 'http://127.0.0.1:4000/api/health',
  },
];

async function main() {
  const hashedPassword = await bcrypt.hash('Admin@BBSMonitor2026', 10);

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: 'admin@bbs-monitor.com' }, { username: 'admin' }],
    },
  });

  if (existingUser) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        username: 'admin',
        email: 'admin@bbs-monitor.com',
        fullName: 'Administrateur BBS Monitor',
        passwordHash: hashedPassword,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
      },
    });
    console.log('SUPER_ADMIN mis à jour avec succès');
  } else {
    await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@bbs-monitor.com',
        fullName: 'Administrateur BBS Monitor',
        passwordHash: hashedPassword,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
      },
    });
    console.log('SUPER_ADMIN créé avec succès');
  }

  for (const svc of DEFAULT_SERVICES) {
    await prisma.service.upsert({
      where: { slug: svc.slug },
      update: {
        name: svc.name,
        description: svc.description,
        category: svc.category,
        baseUrl: svc.baseUrl,
        healthUrl: svc.healthUrl,
      },
      create: svc,
    });
  }

  console.log('Seed OK — admin@bbs-monitor.com / Admin@BBSMonitor2026');
  console.log(`${DEFAULT_SERVICES.length} services par défaut enregistrés`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
