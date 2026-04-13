'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Invoice, Client } from '@/types';
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
import { FileDown, Filter, RefreshCw, Plus } from 'lucide-react';

// Mocks adaptés
const MOCK_INVOICES: Invoice[] = [
  {
    id: 1,
    user_id: 1,
    client_id: 1,
    status: 'paid',
    total_ht: '780.00',
    tva_rate: '20',
    total_ttc: '936.00',
    created_at: '2026-04-10',
    Client: { name: 'Tech Horizon' } as Client,
  },
  {
    id: 2,
    user_id: 1,
    client_id: 2,
    status: 'sent',
    total_ht: '1200.00',
    tva_rate: '20',
    total_ttc: '1440.00',
    created_at: '2026-04-11',
    Client: { name: 'Design Studio' } as Client,
  },
  {
    id: 3,
    user_id: 1,
    client_id: 1,
    status: 'draft',
    total_ht: '450.00',
    tva_rate: '20',
    total_ttc: '540.00',
    created_at: '2026-04-13',
    Client: { name: 'Tech Horizon' } as Client,
  },
];

const STATUS_ORDER = ['draft', 'sent', 'paid', 'cancelled'] as const;

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInvoices(MOCK_INVOICES);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Cycle de statut : Draft -> Sent -> Paid -> Cancelled
  const cycleStatus = (id: number, currentStatus: string) => {
    const currentIndex = STATUS_ORDER.indexOf(
      currentStatus as (typeof STATUS_ORDER)[number]
    );
    const nextIndex = (currentIndex + 1) % STATUS_ORDER.length;
    const nextStatus = STATUS_ORDER[nextIndex];

    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: nextStatus } : inv))
    );
  };

  const downloadPdf = (id: number) => {
    const pdfUrl = `http://localhost:3000/api/invoices/${id}/pdf`;
    window.open(pdfUrl, '_blank');
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-foreground text-3xl font-bold">
            Factures
          </h1>
          <p className="text-muted-foreground">
            Suivez vos paiements et générez vos PDF.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Filter size={18} />
          </Button>
          {/* LIEN VERS LE WIZARD ICI */}
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
              {isLoading
                ? [...Array(4)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="pl-6">
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-32" />
                      </TableCell>
                      <TableCell className="flex justify-center">
                        <Skeleton className="h-7 w-24 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell className="flex justify-end pr-6">
                        <Skeleton className="h-8 w-20" />
                      </TableCell>
                    </TableRow>
                  ))
                : invoices.map((inv) => (
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
                            className={`${getStatusStyle(inv.status)} flex cursor-pointer items-center gap-1.5 px-3 py-1 capitalize`}
                          >
                            <RefreshCw
                              size={10}
                              className="transition-transform duration-700 group-hover:rotate-180"
                            />
                            {inv.status}
                          </Badge>
                        </button>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {inv.total_ttc} €
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
                  ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
