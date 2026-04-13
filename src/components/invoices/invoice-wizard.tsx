'use client';

import { useState, useEffect } from 'react';
import { useInvoiceWizard } from '@/hooks/use-invoice-wizard';
import { clientService } from '@/services/client.service';
import { serviceService } from '@/services/service.service';
import { Client, Service } from '@/types';

export function InvoiceWizard() {
  const {
    lines,
    addLine,
    updateLine,
    totals,
    selectedClientId,
    setSelectedClientId,
  } = useInvoiceWizard();

  // États pour stocker les données du back
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  // 1. Charger les données au montage
  useEffect(() => {
    clientService.getAll().then((res) => setClients(res.data));
    serviceService.getAll().then((res) => setServices(res.data));
  }, []);

  return (
    <div className="mx-auto max-w-2xl rounded-xl border bg-white p-6 shadow-md">
      <h2 className="mb-6 text-2xl font-bold">Nouvelle Facture</h2>

      {/* 2. Client Selector */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium">
          Sélectionner un Client
        </label>
        <select
          value={selectedClientId || ''}
          onChange={(e) => setSelectedClientId(Number(e.target.value))}
          className="w-full rounded-md border p-2"
        >
          <option value="">Choisir un client...</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} - {c.company}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Prestations</h3>
          <button
            type="button"
            onClick={() => addLine()}
            className="rounded-md bg-black px-3 py-1 text-sm text-white hover:opacity-80"
          >
            + Ajouter
          </button>
        </div>

        {/* 3. Dynamic Rows */}
        {lines.map((line, index) => (
          <div
            key={index}
            className="grid grid-cols-12 items-end gap-2 border-b pb-4"
          >
            <div className="col-span-5">
              <label className="text-xs text-gray-500">Service</label>
              <select
                className="w-full rounded border p-1 text-sm"
                onChange={(e) => {
                  const s = services.find(
                    (serv) => serv.id === Number(e.target.value)
                  );
                  if (s) {
                    // Ici on met à jour l'ID ET le prix unitaire
                    updateLine(index, 'service_id', s.id);
                    updateLine(index, 'unit_price', s.hourly_rate);
                  }
                }}
              >
                <option value="">Sélectionner...</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="text-xs text-gray-500">Heures</label>
              <input
                type="number"
                value={line.quantity}
                onChange={(e) => updateLine(index, 'quantity', e.target.value)}
                className="w-full rounded border p-1 text-sm"
              />
            </div>

            <div className="col-span-3 text-right">
              <label className="block text-xs text-gray-500">Total</label>
              <span className="text-sm font-medium">{line.total} €</span>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Final Summary */}
      <div className="mt-8 space-y-2 border-t pt-4">
        <div className="flex justify-between text-sm">
          <span>Total HT</span>
          <span>{totals.total_ht} €</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>TVA (20%)</span>
          <span>{totals.tva_amount} €</span>
        </div>
        <div className="flex justify-between border-t pt-2 text-lg font-bold">
          <span>Total TTC</span>
          <span>{totals.total_ttc} €</span>
        </div>
      </div>
    </div>
  );
}
