'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Invoice } from '@/types';
import { invoiceService } from '@/services/invoice.service';
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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileDown, RefreshCw, Plus, AlertCircle, Download } from 'lucide-react';

const STATUS_ORDER = ['draft', 'sent', 'paid', 'cancelled'] as const;

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Récupération des factures
  const fetchInvoices = () => {
    setIsLoading(true);
    invoiceService
      .getAll()
      .then((res) => {
        setInvoices(res.data);
        setError(null);
      })
      .catch(() => setError('Impossible de charger les factures.'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchInvoices();
    };
    loadData();
  }, []);

  // 2. Cycle de statut RÉEL (Appel API)
  const cycleStatus = async (id: number, currentStatus: string) => {
    const currentIndex = STATUS_ORDER.indexOf(
      currentStatus as (typeof STATUS_ORDER)[number]
    );
    const nextIndex = (currentIndex + 1) % STATUS_ORDER.length;
    const nextStatus = STATUS_ORDER[nextIndex];

    try {
      // Préparation des données à envoyer
      const updateData: Partial<Invoice> = { status: nextStatus };

      // LOGIQUE : Si on passe à 'sent', on définit la date d'émission
      if (nextStatus === 'sent') {
        updateData.issued_at = new Date().toISOString();
      }
      // On met à jour le statut sur le serveur
      await invoiceService.update(id, updateData);
      // On met à jour l'état local pour un feedback instantané
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === id ? { ...inv, ...updateData } : inv))
      );
    } catch {
      alert('Erreur lors du changement de statut.');
    }
  };

  // 3. Téléchargement PDF
  const downloadPdf = async (id: number) => {
    try {
      const response = await invoiceService.generatePDF(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `facture-${id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Erreur lors de la génération du PDF.');
    }
  };

  // 4. Export CSV
  const handleExportCSV = async () => {
    try {
      const response = await invoiceService.exportCSV();
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `factures-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Erreur lors de l'exportation des factures.");
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'sent':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  if (error) {
    return (
      <div className="text-destructive flex h-[50vh] flex-col items-center justify-center gap-2">
        <AlertCircle size={40} />
        <p>{error}</p>
        <Button onClick={fetchInvoices} variant="outline" className="mt-2">
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
            Factures
          </h1>
          <p className="text-muted-foreground">
            Suivez vos paiements et gérez vos PDF.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="border-primary/20 hover:bg-primary/5 text-primary gap-2"
          >
            <Download size={18} /> Exporter CSV
          </Button>
          <Button
            className="gap-2 shadow-sm"
            onClick={() => router.push('/invoices/new')}
          >
            <Plus size={18} /> Nouvelle Facture
          </Button>
        </div>
      </div>

      <Card className="border-border/50 overflow-hidden shadow-sm">
        <CardHeader className="bg-muted/30 border-b py-4">
          <CardTitle className="text-foreground/70 text-sm font-medium">
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              `Total : ${invoices.length} factures`
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow>
                <TableHead className="pl-6 text-xs font-bold tracking-wider uppercase">
                  Référence
                </TableHead>
                <TableHead className="text-xs font-bold tracking-wider uppercase">
                  Client
                </TableHead>
                <TableHead className="text-center text-xs font-bold tracking-wider uppercase">
                  Statut
                </TableHead>
                <TableHead className="text-xs font-bold tracking-wider uppercase">
                  Montant TTC
                </TableHead>
                <TableHead className="pr-6 text-right text-xs font-bold tracking-wider uppercase">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-6">
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="mx-auto h-7 w-24 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <Skeleton className="ml-auto h-8 w-16" />
                    </TableCell>
                  </TableRow>
                ))
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-muted-foreground h-32 text-center italic"
                  >
                    Aucune facture trouvée.
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((inv) => (
                  <TableRow
                    key={inv.id}
                    className="group hover:bg-muted/5 transition-colors"
                  >
                    <TableCell className="text-primary pl-6 font-mono text-xs font-bold">
                      #INV-{inv.id.toString().padStart(4, '0')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {inv.Client?.name || 'Inconnu'}
                    </TableCell>
                    <TableCell className="text-center">
                      <button
                        onClick={() => cycleStatus(inv.id, inv.status)}
                        className="inline-block transition-transform active:scale-95"
                      >
                        <Badge
                          variant="outline"
                          className={`${getStatusStyle(inv.status)} flex cursor-pointer items-center gap-1.5 px-3 py-1 capitalize hover:brightness-95`}
                        >
                          <RefreshCw
                            size={10}
                            className="transition-transform group-hover:rotate-180"
                          />
                          {inv.status}
                        </Badge>
                      </button>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {parseFloat(inv.total_ttc).toFixed(2)} €
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-primary/20 hover:border-primary hover:bg-primary/5 text-primary h-8 gap-2 transition-all"
                        onClick={() => downloadPdf(inv.id)}
                      >
                        <FileDown size={14} />
                        PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
