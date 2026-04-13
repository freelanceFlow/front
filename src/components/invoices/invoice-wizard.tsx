'use client';

import { useState, useEffect } from 'react';
import { useInvoiceWizard } from '@/hooks/use-invoice-wizard';
import { clientService } from '@/services/client.service';
import { serviceService } from '@/services/service.service';
import { Client, Service } from '@/types';

// Import des composants UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export function InvoiceWizard() {
  const {
    lines,
    addLine,
    updateLine,
    totals,
    selectedClientId,
    setSelectedClientId,
    removeLine,
  } = useInvoiceWizard();
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    clientService.getAll().then((res) => setClients(res.data));
    serviceService.getAll().then((res) => setServices(res.data));
  }, []);

  return (
    <Card className="border-border w-full max-w-4xl shadow-lg">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="font-heading text-xl">
            Nouvelle Facture
          </CardTitle>
          <Badge variant="secondary">Brouillon</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Sélecteur Client avec le style Input */}
        <div className="grid gap-2">
          <label className="text-sm font-medium">Client</label>
          <select
            value={selectedClientId || ''}
            onChange={(e) => setSelectedClientId(Number(e.target.value))}
            className="border-input focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none"
          >
            <option value="">Sélectionner un client...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.company})
              </option>
            ))}
          </select>
        </div>

        {/* Table des prestations avec les composants UI */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Service</TableHead>
                <TableHead>Heures</TableHead>
                <TableHead>Prix Unit.</TableHead>
                <TableHead className="text-right">Total HT</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((line, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <select
                      className="w-full bg-transparent text-sm outline-none"
                      value={line.service_id || ''}
                      onChange={(e) => {
                        const s = services.find(
                          (serv) => serv.id === Number(e.target.value)
                        );
                        if (s) {
                          updateLine(index, 'service_id', s.id);
                          updateLine(index, 'unit_price', s.hourly_rate);
                        }
                      }}
                    >
                      <option value="">Choisir...</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      className="h-8 w-20"
                      value={line.quantity}
                      onChange={(e) =>
                        updateLine(index, 'quantity', e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-sm">{line.unit_price} €</TableCell>
                  <TableCell className="text-right font-medium">
                    {line.total} €
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => removeLine(index)}
                      className="text-destructive"
                    >
                      ✕
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Button variant="outline" size="sm" onClick={() => addLine()}>
          + Ajouter une prestation
        </Button>
      </CardContent>

      <CardFooter className="bg-muted/30 flex flex-col items-end gap-2 border-t py-6">
        <div className="text-muted-foreground flex w-full max-w-[250px] justify-between text-sm">
          <span>Total HT</span>
          <span>{totals.total_ht} €</span>
        </div>
        <div className="text-muted-foreground flex w-full max-w-[250px] justify-between text-sm">
          <span>TVA (20%)</span>
          <span>{totals.tva_amount} €</span>
        </div>
        <div className="text-primary flex w-full max-w-[250px] justify-between pt-2 text-lg font-bold">
          <span>Total TTC</span>
          <span>{totals.total_ttc} €</span>
        </div>
        <Button className="mt-4 w-full max-w-[250px]">
          Enregistrer la facture
        </Button>
      </CardFooter>
    </Card>
  );
}
