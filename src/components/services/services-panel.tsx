'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/status-badge';
import { ServiceFormDialog } from './service-form-dialog';
import { deleteService, checkServiceNow } from '@/lib/actions/services';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Service } from '@prisma/client';

type ServiceRow = Service & {
  _count: { healthChecks: number; alerts: number };
};

export function ServicesPanel({ services }: { services: ServiceRow[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [pending, startTransition] = useTransition();

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(s: Service) {
    setEditing(s);
    setDialogOpen(true);
  }

  function runCheck(id: string) {
    startTransition(async () => {
      try {
        await checkServiceNow(id);
        toast.success('Health check exécuté');
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Erreur');
      }
    });
  }

  function remove(id: string) {
    if (!confirm('Supprimer ce service ?')) return;
    startTransition(async () => {
      try {
        await deleteService(id);
        toast.success('Service supprimé');
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Erreur');
      }
    });
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Services surveillés</CardTitle>
          <Button onClick={openCreate} size="sm">
            <Plus className="size-4" />
            Ajouter
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Réponse</TableHead>
                <TableHead>Dernière vérif.</TableHead>
                <TableHead>Alertes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <Link href={`/services/${s.id}`} className="font-medium hover:underline">
                      {s.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{s.healthUrl}</p>
                  </TableCell>
                  <TableCell><StatusBadge status={s.status} /></TableCell>
                  <TableCell>{s.lastResponseMs != null ? `${s.lastResponseMs} ms` : '—'}</TableCell>
                  <TableCell>
                    {s.lastCheckedAt
                      ? formatDistanceToNow(s.lastCheckedAt, { addSuffix: true, locale: fr })
                      : '—'}
                  </TableCell>
                  <TableCell>{s._count.alerts}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => runCheck(s.id)} disabled={pending}>
                        <RefreshCw className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(s)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => remove(s.id)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <ServiceFormDialog open={dialogOpen} onOpenChange={setDialogOpen} service={editing} />
    </>
  );
}
