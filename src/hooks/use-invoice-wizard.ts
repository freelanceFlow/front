import { useState, useMemo } from 'react';
import { Service, InvoiceLine } from '@/types';

export function useInvoiceWizard() {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [lines, setLines] = useState<Partial<InvoiceLine>[]>([]);

  // 1. Ajouter une ligne vide
  const addLine = (service?: Service) => {
    const newLine: Partial<InvoiceLine> = {
      service_id: service?.id || 0,
      quantity: '1',
      unit_price: service?.hourly_rate || '0',
      total: service?.hourly_rate || '0',
    };
    setLines([...lines, newLine]);
  };

  // 2. Mettre à jour une ligne (quantité ou service)
  const updateLine = (
    index: number,
    field: keyof InvoiceLine,
    value: string | number
  ) => {
    const newLines = [...lines];
    const line = { ...newLines[index], [field]: value };

    // Recalcul automatique du total de la ligne
    if (field === 'quantity' || field === 'unit_price') {
      const qte = parseFloat(line.quantity?.toString() || '0');
      const price = parseFloat(line.unit_price?.toString() || '0');
      line.total = (qte * price).toFixed(2);
    }

    newLines[index] = line;
    setLines(newLines);
  };

  // 3. Calculs dynamiques des totaux (HT, TVA, TTC)
  const totals = useMemo(() => {
    const total_ht = lines.reduce(
      (acc, line) => acc + parseFloat(line.total || '0'),
      0
    );
    const tva_rate = 0.2;
    const vta_amount = total_ht * tva_rate;
    const total_ttc = total_ht + vta_amount;

    return {
      total_ht: total_ht.toFixed(2),
      tva_amount: vta_amount.toFixed(2),
      total_ttc: total_ttc.toFixed(2),
    };
  }, [lines]);

  return {
    selectedClientId,
    setSelectedClientId,
    lines,
    addLine,
    updateLine,
    removeLine: (index: number) =>
      setLines(lines.filter((_, i) => i !== index)),
    totals,
  };
}
