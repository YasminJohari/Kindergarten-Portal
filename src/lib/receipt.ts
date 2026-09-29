import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Invoice } from '@/types';
import { formatCurrencyMYR } from './utils';

interface ReceiptOptions {
  transactionId?: string;
  paymentMethod?: string;
  paidDate?: string;
}

export function downloadInvoiceReceipt(
  invoice: Invoice,
  options: ReceiptOptions = {}
): { fileName: string } {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;

  // Header band
  doc.setFillColor(5, 150, 105);
  doc.rect(0, 0, pageWidth, 110, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('TADIKA CAHAYA BINTANG', margin, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('No. Pendaftaran JPS: B4A/9912/2019  |  Seksyen 7, 40000 Shah Alam, Selangor', margin, 60);
  doc.text('Tel: +60 3-5521 8900  |  WhatsApp: +60 19-332 1109', margin, 74);

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(pageWidth - margin - 170, 24, 170, 62, 8, 8, 'F');
  doc.setTextColor(5, 150, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('RESIT RASMI', pageWidth - margin - 85, 50, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(invoice.invoiceNumber, pageWidth - margin - 85, 66, { align: 'center' });

  // Meta block
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(10);
  let y = 140;
  doc.setFont('helvetica', 'bold');
  doc.text('Diterima Daripada:', margin, y);
  doc.text('Tarikh Transaksi:', pageWidth - margin - 190, y);
  y += 16;
  doc.setFont('helvetica', 'normal');
  doc.text(String(invoice.parentName || '-'), margin, y);
  doc.text(String(options.paidDate || invoice.paidDate || invoice.issueDate || '-'), pageWidth - margin - 190, y);
  y += 15;
  doc.text(`Waris kepada: ${invoice.studentName || '-'}`, margin, y);
  doc.text(
    `Kaedah: ${(options.paymentMethod || invoice.paymentMethod || 'FPX').toString().toUpperCase()}`,
    pageWidth - margin - 190,
    y
  );
  y += 15;
  doc.text(`Kelas: ${invoice.className || '-'}`, margin, y);
  doc.text(
    `Ref: ${(options.transactionId || invoice.transactionId || 'FPX-SYS-772190').toString()}`,
    pageWidth - margin - 190,
    y
  );

  // Items table
  autoTable(doc, {
    startY: y + 22,
    head: [['#', 'Keterangan Item Yuran', 'Jumlah (RM)']],
    body: (invoice.items || []).map((item, idx) => [
      String(idx + 1),
      String(item.description || '-'),
      Number(item.amount || 0).toFixed(2),
    ]),
    foot: [['', 'JUMLAH KESELURUHAN (MYR)', formatCurrencyMYR(Number(invoice.total || 0))]],
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 8 },
    headStyles: { fillColor: [5, 150, 105], textColor: 255 },
    footStyles: { fillColor: [236, 253, 245], textColor: [6, 95, 70], fontStyle: 'bold' },
    columnStyles: {
      0: { halign: 'center', cellWidth: 40 },
      2: { halign: 'right', cellWidth: 120 },
    },
    margin: { left: margin, right: margin },
  });

  const tableState = (autoTable as unknown as { previous?: { finalY?: number } }).previous;
  const afterTable = (tableState?.finalY ?? y + 160) + 30;
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(
    'Resit cetakan komputer ini adalah sah dan tidak memerlukan tandatangan fizikal.',
    margin,
    afterTable
  );
  doc.text('Terima kasih atas kerjasama anda bersama Tadika Cahaya Bintang.', margin, afterTable + 14);

  const fileName = `${(invoice.invoiceNumber || 'resit').replace(/[^A-Za-z0-9-_]+/g, '-')}.pdf`;
  doc.save(fileName);
  return { fileName };
}
