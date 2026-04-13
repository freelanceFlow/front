import { useState, useMemo } from 'react';
import { Service, InvoiceLine } from '@/types';
import { useRouter } from 'next/navigation';

export function useInvoiceWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [lines, setLines] = useState<Partial<InvoiceLine>[]>([]);

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const addLine = (service?: Service) => {
    const newLine: Partial<InvoiceLine> = {
      service_id: service?.id || 0,
      quantity: '1',
      unit_price: service?.hourly_rate || '0',
      total: service?.hourly_rate || '0',
    };
    setLines([...lines, newLine]);
  };

  const updateLine = (
    index: number,
    field: keyof InvoiceLine,
    value: string | number
  ) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };

    if (field === 'quantity' || field === 'unit_price') {
      const qte = parseFloat(newLines[index].quantity?.toString() || '0');
      const price = parseFloat(newLines[index].unit_price?.toString() || '0');
      newLines[index].total = (qte * price).toFixed(2);
    }
    setLines(newLines);
  };

  const totals = useMemo(() => {
    const ht = lines.reduce(
      (acc, line) => acc + parseFloat(line.total || '0'),
      0
    );
    const tva = ht * 0.2;
    return { ht, tva, ttc: ht + tva };
  }, [lines]);

  const saveInvoice = async () => {
    setIsSubmitting(true);

    // Simulation du JSON final à envoyer au backend
    const payload = {
      client_id: selectedClientId,
      date: new Date().toISOString(),
      status: 'draft',
      lines: lines,
      totals: {
        total_ht: totals.ht.toFixed(2),
        tva_amount: totals.tva.toFixed(2),
        total_ttc: totals.ttc.toFixed(2),
      },
    };

    console.log('Envoi au backend :', payload);

    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/invoices'); // Retour au dashboard après succès
    }, 1500);
  };

  return {
    step,
    nextStep,
    prevStep,
    selectedClientId,
    setSelectedClientId,
    lines,
    addLine,
    updateLine,
    removeLine: (index: number) =>
      setLines(lines.filter((_, i) => i !== index)),
    totals,
    isSubmitting,
    saveInvoice,
  };
}
