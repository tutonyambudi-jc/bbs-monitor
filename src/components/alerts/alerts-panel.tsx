'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { acknowledgeAlert, resolveAlert } from '@/lib/actions/alerts';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Alert, AlertSeverity } from '@prisma/client';

type AlertRow = Alert & {
  service: { id: string; name: string; slug: string } | null;
};

const severityClass: Record<AlertSeverity, string> = {
  INFO: 'bg-blue-500/15 text-blue-700',
  WARNING: 'bg-amber-500/15 text-amber-800',
  CRITICAL: 'bg-red-500/15 text-red-700',
};

export function AlertsPanel({ alerts }: { alerts: AlertRow[] }) {
  const [pending, startTransition] = useTransition();

  function act(id: string, action: 'ack' | 'resolve') {
    startTransition(async () => {
      try {
        if (action === 'ack') await acknowledgeAlert(id);
        else await resolveAlert(id);
        toast.success('Alerte mise à jour');
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Erreur');
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Titre</TableHead>
              <TableHead>Sévérité</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.map((a) => (
              <TableRow key={a.id}>
                <TableCell>{format(a.createdAt, 'dd/MM/yyyy HH:mm', { locale: fr })}</TableCell>
                <TableCell>{a.service?.name ?? '—'}</TableCell>
                <TableCell>
                  <p className="font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.message}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={severityClass[a.severity]}>{a.severity}</Badge>
                </TableCell>
                <TableCell>{a.status}</TableCell>
                <TableCell className="text-right">
                  {a.status === 'OPEN' && (
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="outline" disabled={pending} onClick={() => act(a.id, 'ack')}>
                        Acquitter
                      </Button>
                      <Button size="sm" disabled={pending} onClick={() => act(a.id, 'resolve')}>
                        Résoudre
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
