import { NextResponse } from 'next/server';
import { checkAllEnabledServices } from '@/lib/health-check';
import { collectServerMetrics } from '@/lib/server-metrics';

export const dynamic = 'force-dynamic';

function authorize(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 16) return false;
  const header = request.headers.get('authorization');
  const bearer = header?.match(/^Bearer\s+(.+)$/i)?.[1];
  const apiKey = request.headers.get('x-cron-secret');
  const token = bearer ?? apiKey ?? '';
  return token === secret;
}

export async function POST(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const [checks, metric] = await Promise.all([
    checkAllEnabledServices(),
    collectServerMetrics(),
  ]);

  return NextResponse.json({
    ok: true,
    checked: checks.length,
    checks,
    metric,
    timestamp: new Date().toISOString(),
  });
}
