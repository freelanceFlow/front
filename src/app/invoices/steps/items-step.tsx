'use client';

import { useState, useEffect } from 'react';
import { serviceService } from '@/services/service.service';
import { Service, InvoiceLine } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2, Plus, Calculator } from 'lucide-react';

interface ItemsStepProps {
  wizard: {
    lines: Partial<InvoiceLine>[];
    addLine: (service?: Service) => void;
    updateLine: (
      index: number,
      field: keyof InvoiceLine,
      value: string | number
    ) => void;
    removeLine: (index: number) => void;
    totals: { ht: number; tva: number; ttc: number };
  };
}

export function ItemsStep({ wizard }: ItemsStepProps) {
  const { lines, addLine, updateLine, removeLine, totals } = wizard;
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    serviceService.getAll().then((res) => setServices(res.data));
  }, []);

  return (
    <div className="animate-in fade-in space-y-6 duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Détail des prestations</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => addLine()}
          className="border-primary/50 hover:border-primary gap-2 border-dashed"
        >
          <Plus size={16} />
          Ajouter une ligne
        </Button>
      </div>

      <div className="bg-card rounded-md border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[45%]">Service / Désignation</TableHead>
              <TableHead className="w-[15%]">Quantité</TableHead>
              <TableHead className="w-[15%]">Prix Unitaire</TableHead>
              <TableHead className="w-[20%] text-right">Total HT</TableHead>
              <TableHead className="w-[5%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground h-24 text-center italic"
                >
                  Aucune prestation ajoutée.
                </TableCell>
              </TableRow>
            ) : (
              lines.map((line, index) => (
                <TableRow key={index} className="group transition-colors">
                  <TableCell>
                    <select
                      className="border-input focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none"
                      // CORRECTION CRUCIALE : toString() pour matcher la value des options
                      value={line.service_id?.toString() || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const s = services.find(
                          (serv) => serv.id === Number(val)
                        );
                        if (s) {
                          updateLine(index, 'service_id', s.id);
                          updateLine(index, 'unit_price', s.hourly_rate);
                        }
                      }}
                    >
                      <option value="">Sélectionner un service...</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.id.toString()}>
                          {s.label} ({s.hourly_rate}€/h)
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="1"
                      className="h-9"
                      value={line.quantity}
                      onChange={(e) =>
                        updateLine(index, 'quantity', e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {line.unit_price} €
                  </TableCell>
                  <TableCell className="text-primary text-right font-bold">
                    {line.total} €
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLine(index)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end pt-4">
        <div className="bg-muted/30 border-border/50 min-w-[200px] rounded-lg border p-4">
          <div className="text-muted-foreground mb-2 flex items-center gap-2">
            <Calculator size={14} />
            <span className="text-xs font-bold tracking-wider uppercase">
              Sous-total
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-muted-foreground text-sm">Total HT :</span>
            <span className="text-xl font-bold">{totals.ht.toFixed(2)} €</span>
          </div>
        </div>
      </div>
    </div>
  );
}
