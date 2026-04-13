'use client';

import { useState, useEffect } from 'react';
import { Client } from '@/types';
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
import { Plus, Pencil, Trash2, Building2, Mail, MapPin } from 'lucide-react';
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

const MOCK_CLIENTS: Client[] = [
  {
    id: 1,
    user_id: 1,
    name: 'Thomas Legrand',
    email: 'thomas@tech-horizon.fr',
    company: 'Tech Horizon',
    address: '12 rue de la Paix, Paris',
    created_at: '',
  },
  {
    id: 2,
    user_id: 1,
    name: 'Sophie Bernard',
    email: 's.bernard@design-studio.com',
    company: 'Design Studio',
    address: '5 avenue des Arts, Lyon',
    created_at: '',
  },
];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // States pour les Modales
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setClients(MOCK_CLIENTS);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Handlers
  const handleOpenCreate = () => {
    setSelectedClient(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setSelectedClient(client);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-foreground text-3xl font-bold">
            Clients
          </h1>
          <p className="text-muted-foreground">Gérez votre base de contacts.</p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus size={18} /> Nouveau Client
        </Button>
      </div>

      {/* Table Card */}
      <Card className="border-border/50 overflow-hidden shadow-sm">
        <CardHeader className="bg-muted/30 border-b py-4">
          <CardTitle className="text-sm font-medium">
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              `Liste des clients (${clients.length})`
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow>
                <TableHead className="pl-6 text-xs tracking-wider uppercase">
                  Nom & Entreprise
                </TableHead>
                <TableHead className="text-xs tracking-wider uppercase">
                  Email
                </TableHead>
                <TableHead className="text-xs tracking-wider uppercase">
                  Adresse
                </TableHead>
                <TableHead className="pr-6 text-right text-xs tracking-wider uppercase">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? [...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="pl-6">
                        <Skeleton className="h-5 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell className="flex justify-end gap-2 pr-6">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </TableCell>
                    </TableRow>
                  ))
                : clients.map((client) => (
                    <TableRow
                      key={client.id}
                      className="group hover:bg-muted/5 transition-colors"
                    >
                      <TableCell className="pl-6">
                        <div className="font-semibold">{client.name}</div>
                        <div className="text-muted-foreground flex items-center gap-1 text-xs">
                          <Building2 size={12} />{' '}
                          {client.company || 'Individuel'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Mail size={12} className="text-muted-foreground" />{' '}
                          {client.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-muted-foreground flex items-center gap-1 text-sm">
                          <MapPin size={12} /> {client.address || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            onClick={() => handleOpenEdit(client)}
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-foreground h-8 w-8"
                          >
                            <Pencil size={14} />
                          </Button>
                          <Button
                            onClick={() => handleOpenDelete(client)}
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

      {/* --- MODALES (ISSUE #6) --- */}

      {/* 1. Modale de Création / Édition */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedClient ? 'Modifier le client' : 'Ajouter un client'}
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations de votre client. Cliquez sur
              enregistrer une fois terminé.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                defaultValue={selectedClient?.name}
                placeholder="Jean Dupont"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={selectedClient?.email}
                placeholder="jean@exemple.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company">Entreprise</Label>
              <Input
                id="company"
                defaultValue={selectedClient?.company}
                placeholder="Dupont SARL"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                defaultValue={selectedClient?.address}
                placeholder="123 rue de Paris"
              />
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

      {/* 2. Modale de Confirmation de Suppression */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-destructive">
              Supprimer le client
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer{' '}
              <strong>{selectedClient?.name}</strong> ? Cette action est
              irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive">Confirmer la suppression</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
