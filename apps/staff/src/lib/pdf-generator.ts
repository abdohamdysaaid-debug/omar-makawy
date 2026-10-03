import { jsPDF } from 'jspdf';

export interface PDFBatchInput {
  title: string;
  type: 'WALLET' | 'DISCOUNT';
  amount?: number | string;
  discountType?: string;
  discountValue?: number | string;
  codes: Array<{
    raw?: string;
    code?: string;
    preview?: string;
    code_preview?: string;
    amount?: number | string;
    discount_value?: any;
    discount_type?: string;
    expires_at?: any;
  }>;
}

/**
 * Generates and downloads a high-fidelity A4 PDF with stylish rectangular voucher cards (10 per page)
 */
export function generateBatchPDF(batch: PDFBatchInput, filename?: string) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const codes = batch.codes || [];
  if (codes.length === 0) return;

  const cols = 2;
  const rows = 5;
  const cardsPerPage = cols * rows; // 10 cards per A4 page
  const cardWidth = 88;
  const cardHeight = 48;
  const gapX = 10;
  const gapY = 7;
  const startX = 12; // (210 - (88*2 + 10)) / 2 = 12mm
  const startY = 14; // (297 - (48*5 + 7*4)) / 2 = 14.5mm

  const totalPages = Math.ceil(codes.length / cardsPerPage);

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    if (pageIdx > 0) {
      doc.addPage('a4', 'portrait');
    }

    // Page Header & Watermark
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(50, 60, 80);
    doc.text('MR. OMAR MAKAWY — OFFICIAL PLATFORM VOUCHERS', 105, 8, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(140, 150, 165);
    doc.text(
      `Batch: ${batch.title || 'Vouchers'} | Page ${pageIdx + 1} of ${totalPages} | Generated: ${new Date().toLocaleDateString('en-GB')}`,
      105,
      11.5,
      { align: 'center' },
    );

    // Render Cards Grid (2x5)
    for (let slot = 0; slot < cardsPerPage; slot++) {
      const codeIndex = pageIdx * cardsPerPage + slot;
      if (codeIndex >= codes.length) break;

      const item = codes[codeIndex];
      const col = slot % cols;
      const row = Math.floor(slot / cols);

      const x = startX + col * (cardWidth + gapX);
      const y = startY + row * (cardHeight + gapY);

      const codeStr = item.raw || item.code || item.preview || item.code_preview || 'CODE';

      // 1. Outer Card Box with dashed border
      doc.setDrawColor(180, 190, 205);
      doc.setLineWidth(0.35);
      doc.setFillColor(253, 254, 255);
      doc.roundedRect(x, y, cardWidth, cardHeight, 2.5, 2.5, 'FD');

      // 2. Card Header (Brand + Serial)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      if (batch.type === 'WALLET') {
        doc.setTextColor(4, 120, 87); // Emerald
      } else {
        doc.setTextColor(67, 56, 202); // Indigo
      }
      doc.text('MR. OMAR MAKAWY', x + 4, y + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(150, 160, 175);
      doc.text(`#${String(codeIndex + 1).padStart(3, '0')}`, x + cardWidth - 4, y + 5.5, { align: 'right' });

      // Thin separator
      doc.setDrawColor(225, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(x + 3, y + 7.5, x + cardWidth - 3, y + 7.5);

      // 3. Value Banner
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      if (batch.type === 'WALLET') {
        doc.setTextColor(5, 150, 105);
        const amountText = `CARD VALUE: ${batch.amount || item.amount || 100} EGP`;
        doc.text(amountText, x + cardWidth / 2, y + 13.5, { align: 'center' });
      } else {
        doc.setTextColor(79, 70, 229);
        const discVal = batch.discountValue || item.discount_value || 10;
        const discType = batch.discountType || item.discount_type || 'PERCENTAGE';
        const discText = `DISCOUNT: ${discVal}${discType === 'PERCENTAGE' ? '%' : ' EGP'} OFF`;
        doc.text(discText, x + cardWidth / 2, y + 13.5, { align: 'center' });
      }

      // 4. Code Box (High Contrast Monospace Container)
      doc.setFillColor(243, 246, 250);
      doc.setDrawColor(30, 41, 59);
      doc.setLineWidth(0.4);
      doc.roundedRect(x + 6, y + 17, cardWidth - 12, 13.5, 1.5, 1.5, 'FD');

      doc.setFont('courier', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(codeStr, x + cardWidth / 2, y + 25.5, { align: 'center' });

      // Security watermark subtext
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor(140, 150, 165);
      doc.text('SCRATCH OR ENTER CODE TO REDEEM', x + cardWidth / 2, y + 29.5, { align: 'center' });

      // 5. Card Footer (Platform Name + Expiry)
      doc.setDrawColor(225, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(x + 3, y + 41.5, x + cardWidth - 3, y + 41.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(120, 130, 145);
      doc.text('omarmeckawy.com', x + 4, y + 45.2);

      let expStr = 'No Expiry';
      if (item.expires_at) {
        expStr = `Exp: ${new Date(item.expires_at).toLocaleDateString('en-GB')}`;
      }
      doc.text(expStr, x + cardWidth - 4, y + 45.2, { align: 'right' });
    }
  }

  const cleanName =
    filename ||
    `vouchers-${batch.type.toLowerCase()}-${batch.amount || batch.discountValue || 'batch'}-${Date.now()}.pdf`;

  doc.save(cleanName);
}
