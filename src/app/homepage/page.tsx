'use client';

import { useState, useMemo } from 'react';
import { Invoice, Client } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Briefcase,
  FileText,
  ArrowRight,
  TrendingUp,
  Wallet,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

// 1. Mocks pour les factures (à remplacer par un appel API réel)
const MOCK_INVOICES: Invoice[] = [
  {
    id: 1,
    user_id: 1,
    client_id: 1,
    status: 'paid',
    total_ht: '1000.00',
    tva_rate: '20',
    total_ttc: '1200.00',
    created_at: '',
    Client: { name: 'Client A' } as Client,
  },
  {
    id: 2,
    user_id: 1,
    client_id: 2,
    status: 'sent',
    total_ht: '500.00',
    tva_rate: '20',
    total_ttc: '600.00',
    created_at: '',
    Client: { name: 'Client B' } as Client,
  },
  {
    id: 3,
    user_id: 1,
    client_id: 1,
    status: 'paid',
    total_ht: '2000.00',
    tva_rate: '20',
    total_ttc: '2400.00',
    created_at: '',
    Client: { name: 'Client A' } as Client,
  },
  {
    id: 4,
    user_id: 1,
    client_id: 3,
    status: 'draft',
    total_ht: '150.00',
    tva_rate: '20',
    total_ttc: '1800.00',
    created_at: '',
    Client: { name: 'Client C' } as Client,
  },
];

export default function DashboardPage() {
  // On initialise directement avec les mocks pour que le dashboard ne soit pas vide
  const [invoices] = useState<Invoice[]>(MOCK_INVOICES);

  // 2. Calcul des KPIs en temps réel
  const stats = useMemo(() => {
    const paidInvoices = invoices.filter((inv) => inv.status === 'paid');
    const pendingInvoices = invoices.filter((inv) => inv.status === 'sent');

    const caTotal = paidInvoices.reduce(
      (acc, inv) => acc + parseFloat(inv.total_ht),
      0
    );
    const totalPending = pendingInvoices.reduce(
      (acc, inv) => acc + parseFloat(inv.total_ttc),
      0
    );

    return {
      caTotal: caTotal.toFixed(2),
      totalPending: totalPending.toFixed(2),
      countPending: pendingInvoices.length,
      recent: invoices.slice(0, 5),
    };
  }, [invoices]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-foreground text-3xl font-bold">
          Tableau de bord
        </h1>
        <p className="text-muted-foreground">
          Voici ce qui se passe dans votre activité.
        </p>
      </div>

      {/* KPIs Dynamiques */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50 shadow-sm">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="bg-primary/10 text-primary rounded-xl p-3">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Chiffre d&apos;Affaires HT
              </p>
              <h3 className="text-2xl font-bold">{stats.caTotal} €</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-xl bg-amber-500/10 p-3 text-amber-600">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Encours (TTC)
              </p>
              <h3 className="text-2xl font-bold text-amber-600">
                {stats.totalPending} €
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-xl bg-blue-500/10 p-3 text-blue-600">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Factures en attente
              </p>
              <h3 className="text-2xl font-bold text-blue-600">
                {stats.countPending}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Navigation Rapide */}
        <div className="space-y-4 lg:col-span-1">
          <h2 className="px-1 text-lg font-semibold">Accès rapide</h2>
          <div className="grid gap-3">
            <QuickLink
              href="/invoices"
              icon={<FileText size={18} />}
              title="Factures"
              color="bg-primary"
            />
            <QuickLink
              href="/clients"
              icon={<Users size={18} />}
              title="Clients"
              color="bg-secondary"
            />
            <QuickLink
              href="/prestations"
              icon={<Briefcase size={18} />}
              title="Prestations"
              color="bg-accent"
            />
          </div>
        </div>

        {/* Dernières Factures */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Dernières factures</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {stats.recent.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">
                      #INV-00{inv.id}
                    </TableCell>
                    <TableCell>
                      {inv.Client?.name || 'Client inconnu'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          inv.status === 'paid' ? 'default' : 'secondary'
                        }
                      >
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {inv.total_ttc} €
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Petit composant interne pour les liens rapides
function QuickLink({
  href,
  icon,
  title,
  color,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="border-border bg-card hover:bg-muted/50 group flex items-center justify-between rounded-xl border p-4 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-2 text-white ${color}`}>{icon}</div>
        <span className="font-medium">{title}</span>
      </div>
      <ArrowRight
        size={16}
        className="text-muted-foreground transition-transform group-hover:translate-x-1"
      />
    </Link>
  );
}
