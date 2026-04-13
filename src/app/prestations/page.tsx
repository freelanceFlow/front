'use client';

import { useState, useEffect } from 'react';
import { Service } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, Briefcase, Euro } from 'lucide-react';
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

const MOCK_SERVICES: Service[] = [
  {
    id: 1,
    user_id: 1,
    label: 'Développement Web Fullstack',
    hourly_rate: '60.00',
    created_at: '',
  },
  {
    id: 2,
    user_id: 1,
    label: 'Consulting Architecture Cloud',
    hourly_rate: '85.00',
    created_at: '',
  },
  {
    id: 3,
    user_id: 1,
    label: 'Maintenance & Support HT',
    hourly_rate: '45.00',
    created_at: '',
  },
];

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // States pour les Modales
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setServices(MOCK_SERVICES);
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenCreate = () => {
    setSelectedService(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (service: Service) => {
    setSelectedService(service);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (service: Service) => {
    setSelectedService(service);
    setIsDeleteOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-foreground text-3xl font-bold">
            Prestations
          </h1>
          <p className="text-muted-foreground font-sans text-sm">
            Gérez votre catalogue de prestations et vos tarifs.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus size={18} /> Nouvelle Prestation
        </Button>
      </div>

      {/* Table Card */}
      <Card className="border-border/50 overflow-hidden shadow-sm">
        <CardHeader className="bg-muted/30 border-b py-4">
          <CardTitle className="text-sm font-medium">
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              `Catalogue (${services.length} prestations)`
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow>
                <TableHead className="pl-6 text-xs font-semibold uppercase">
                  Intitulé de la prestation
                </TableHead>
                <TableHead className="text-center text-xs font-semibold uppercase">
                  Tarif horaire (HT)
                </TableHead>
                <TableHead className="pr-6 text-right text-xs font-semibold uppercase">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? [...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="pl-6">
                        <Skeleton className="h-5 w-48" />
                      </TableCell>
                      <TableCell className="text-center">
                        <Skeleton className="mx-auto h-5 w-20" />
                      </TableCell>
                      <TableCell className="flex justify-end gap-2 pr-6">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </TableCell>
                    </TableRow>
                  ))
                : services.map((service) => (
                    <TableRow
                      key={service.id}
                      className="group hover:bg-muted/5 transition-colors"
                    >
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <div className="bg-accent/10 text-accent-foreground rounded-lg p-2">
                            <Briefcase size={16} />
                          </div>
                          <span className="text-foreground font-semibold">
                            {service.label}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="bg-muted inline-flex items-center gap-1 rounded px-2 py-1 font-mono text-sm">
                          {service.hourly_rate} € /h
                        </div>
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            onClick={() => handleOpenEdit(service)}
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-foreground h-8 w-8"
                          >
                            <Pencil size={14} />
                          </Button>
                          <Button
                            onClick={() => handleOpenDelete(service)}
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10 h-8 w-8"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* --- MODALES --- */}

      {/* 1. Modale Création / Édition */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedService
                ? 'Modifier la prestation'
                : 'Ajouter une prestation'}
            </DialogTitle>
            <DialogDescription>
              Définissez le nom de la prestation et votre taux horaire par
              défaut.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="label">Intitulé de la prestation</Label>
              <Input
                id="label"
                defaultValue={selectedService?.label}
                placeholder="ex: Développement Frontend"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rate">Tarif horaire HT (€)</Label>
              <div className="relative">
                <Input
                  id="rate"
                  type="number"
                  step="0.01"
                  defaultValue={selectedService?.hourly_rate}
                  placeholder="0.00"
                  className="pl-8"
                />
                <Euro
                  size={14}
                  className="text-muted-foreground absolute top-3 left-2.5"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Annuler
            </Button>
            <Button type="submit">Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Modale Suppression */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-destructive">
              Supprimer la prestation
            </DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment retirer{' '}
              <strong>{selectedService?.label}</strong> de votre catalogue ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive">Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
