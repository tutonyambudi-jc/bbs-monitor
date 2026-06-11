'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createService, updateService } from '@/lib/actions/services';
import { toast } from 'sonner';
import type { Service, ServiceCategory } from '@prisma/client';

const CATEGORIES: { value: ServiceCategory; label: string }[] = [
  { value: 'ERP_BBS', label: 'ERP BBS' },
  { value: 'TRAVELIA_ERP', label: 'Travelia ERP' },
  { value: 'TRAVELIA_API', label: 'Travelia API' },
  { value: 'TRAVELIA_WEB', label: 'Travelia Web' },
  { value: 'ECHO_CHALLENGE', label: 'Echo Challenge' },
  { value: 'OTHER', label: 'Autre' },
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: Service | null;
};

export function ServiceFormDialog({ open, onOpenChange, service }: Props) {
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: service?.name ?? '',
    slug: service?.slug ?? '',
    description: service?.description ?? '',
    category: (service?.category ?? 'OTHER') as ServiceCategory,
    baseUrl: service?.baseUrl ?? '',
    healthUrl: service?.healthUrl ?? '',
    isEnabled: service?.isEnabled ?? true,
    degradedMs: service?.degradedMs ?? 2000,
  });

  function submit() {
    startTransition(async () => {
      try {
        const payload = {
          ...form,
          description: form.description || undefined,
          baseUrl: form.baseUrl || undefined,
        };
        if (service) {
          await updateService(service.id, payload);
          toast.success('Service mis à jour');
        } else {
          await createService(payload);
          toast.success('Service créé');
        }
        onOpenChange(false);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Erreur');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{service ? 'Modifier le service' : 'Nouveau service'}</DialogTitle>
          <DialogDescription>URL health check et seuil DEGRADED (ms)</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid gap-1">
            <Label>Nom</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="grid gap-1">
            <Label>Slug</Label>
            <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} disabled={!!service} />
          </div>
          <div className="grid gap-1">
            <Label>Catégorie</Label>
            <select
              className="h-8 w-full rounded-lg border border-input px-2 text-sm"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ServiceCategory }))}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-1">
            <Label>URL de base</Label>
            <Input value={form.baseUrl} onChange={(e) => setForm((f) => ({ ...f, baseUrl: e.target.value }))} placeholder="https://..." />
          </div>
          <div className="grid gap-1">
            <Label>URL health check *</Label>
            <Input value={form.healthUrl} onChange={(e) => setForm((f) => ({ ...f, healthUrl: e.target.value }))} placeholder="https://.../api/health" />
          </div>
          <div className="grid gap-1">
            <Label>Seuil DEGRADED (ms)</Label>
            <Input type="number" value={form.degradedMs} onChange={(e) => setForm((f) => ({ ...f, degradedMs: Number(e.target.value) }))} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isEnabled} onChange={(e) => setForm((f) => ({ ...f, isEnabled: e.target.checked }))} />
            Surveillance active
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={submit} disabled={pending}>{service ? 'Enregistrer' : 'Créer'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
