'use client';

import { useState, useEffect } from 'react';
import { Client } from '@/types';
import { clientService } from '@/services/client.service';
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
import {
  Plus,
  Pencil,
  Trash2,
  Building2,
  Mail,
  MapPin,
  AlertCircle,
  Download,
} from 'lucide-react';
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

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States pour les Modales
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // 1. Chargement initial
  const fetchClients = () => {
    setIsLoading(true);
    clientService
      .getAll()
      .then((res) => {
        setClients(res.data);
        setError(null);
      })
      .catch(() => setError('Erreur lors de la récupération des clients'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // 2. Handlers API
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const clientData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      company: formData.get('company') as string,
      address: formData.get('address') as string,
    };

    try {
      if (selectedClient) {
        await clientService.update(selectedClient.id, clientData);
      } else {
        await clientService.create(clientData);
      }
      setIsFormOpen(false);
      fetchClients(); // Rafraîchir la liste
    } catch {
      alert("Erreur lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedClient) return;
    setIsSubmitting(true);
    try {
      await clientService.delete(selectedClient.id);
      setIsDeleteOpen(false);
      fetchClients();
    } catch {
      alert('Erreur lors de la suppression');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Handler pour l'export CSV
  const handleExportCSV = async () => {
    try {
      const response = await clientService.exportCSV();
      // Création d'un lien temporaire pour déclencher le téléchargement
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `clients-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove(); // On nettoie le DOM
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Erreur lors de l'exportation des données.");
    }
  };

  // Handlers Ouvertures Modales
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

  if (error) {
    return (
      <div className="text-destructive flex h-[50vh] flex-col items-center justify-center gap-2">
        <AlertCircle size={40} />
        <p>{error}</p>
        <Button onClick={fetchClients} variant="outline" className="mt-2">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-foreground text-3xl font-bold">
            Clients
          </h1>
          <p className="text-muted-foreground">Gérez votre base de contacts.</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="border-primary/20 hover:bg-primary/5 text-primary gap-2"
          >
            <Download size={18} /> Exporter CSV
          </Button>
          <Button onClick={handleOpenCreate} className="gap-2 shadow-sm">
            <Plus size={18} /> Nouveau Client
          </Button>
        </div>
      </div>

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
              {isLoading ? (
                [...Array(5)].map((_, i) => (
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
              ) : clients.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-muted-foreground h-32 text-center italic"
                  >
                    Aucun client trouvé.
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow
                    key={client.id}
                    className="group hover:bg-muted/5 transition-colors"
                  >
                    <TableCell className="pl-6">
                      <div className="font-semibold">{client.name}</div>
                      <div className="text-muted-foreground flex items-center gap-1 text-xs">
                        <Building2 size={12} /> {client.company || 'Individuel'}
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
                          className="h-8 w-8"
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          onClick={() => handleOpenDelete(client)}
                          variant="ghost"
                          size="icon"
                          className="text-destructive h-8 w-8"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 1. Modale de Création / Édition */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {selectedClient ? 'Modifier le client' : 'Ajouter un client'}
              </DialogTitle>
              <DialogDescription>
                Remplissez les informations ci-dessous.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={selectedClient?.name}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={selectedClient?.email}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company">Entreprise</Label>
                <Input
                  id="company"
                  name="company"
                  defaultValue={selectedClient?.company}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  name="address"
                  defaultValue={selectedClient?.address}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. Suppression */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">
              Supprimer le client
            </DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment supprimer{' '}
              <strong>{selectedClient?.name}</strong> ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Suppression...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
