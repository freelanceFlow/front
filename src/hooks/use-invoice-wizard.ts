import { useState, useMemo } from 'react';
import { Service, InvoiceLine, Invoice } from '@/types';
import { useRouter } from 'next/navigation';
import { invoiceService } from '@/services/invoice.service';

export type InvoiceWizardReturn = ReturnType<typeof useInvoiceWizard>;

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
      service_id: service?.id || undefined,
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
    if (!selectedClientId || lines.length === 0) {
      alert('Veuillez sélectionner un client et au moins une prestation.');
      return;
    }

    setIsSubmitting(true);

    // On utilise "any" ici pour le payload pour éviter les erreurs de noms de propriétés
    // (comme 'date' vs 'invoice_date') tout en envoyant les bonnes données au service
    const payload = {
      client_id: selectedClientId,
      issued_at: new Date().toISOString(),
      status: 'draft' as Invoice['status'],
      total_ht: totals.ht.toFixed(2),
      total_ttc: totals.ttc.toFixed(2),
      lines: lines.map((line) => ({
        service_id: Number(line.service_id),
        quantity: line.quantity?.toString() || '0',
        unit_price: line.unit_price?.toString() || '0',
        total: line.total?.toString() || '0',
      })),
    };

    try {
      // On passe le payload typé en "any" au service qui s'occupera de l'envoi
      await invoiceService.create(payload as Partial<Invoice>);
      router.push('/invoices');
      router.refresh();
    } catch (error) {
      console.error("Erreur lors de l'envoi :", error);
      alert("Erreur lors de l'enregistrement en base de données.");
    } finally {
      setIsSubmitting(false);
    }
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
