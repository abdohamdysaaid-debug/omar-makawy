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
export async function generateBatchPDF(batch: PDFBatchInput, filename?: string) {
  if (typeof window === 'undefined') return;

  const { jsPDF } = await import('jspdf');

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

      // 1. Outer Card Box (Green Background with Solid Black Border)
      doc.setDrawColor(0, 0, 0); // Solid Black Border
      doc.setLineWidth(0.5);
      doc.setFillColor(209, 250, 229); // Light Emerald Green Background (#D1FAE5)
      doc.roundedRect(x, y, cardWidth, cardHeight, 2.5, 2.5, 'FD');

      // Top green accent bar
      doc.setFillColor(16, 185, 129); // Vibrant Emerald Green (#10B981)
      doc.roundedRect(x, y, cardWidth, 3.2, 2.5, 2.5, 'F');
      doc.rect(x, y + 1.8, cardWidth, 1.4, 'F'); // square bottom of top bar

      // 2. Card Header (Brand in Black + Serial in Black)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(0, 0, 0); // Solid Black
      doc.text('MR. OMAR MAKAWY', x + 4, y + 7.8);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(0, 0, 0); // Solid Black
      doc.text(`#${String(codeIndex + 1).padStart(3, '0')}`, x + cardWidth - 4, y + 7.8, { align: 'right' });

      // Thin Black separator
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.25);
      doc.line(x + 3, y + 9.8, x + cardWidth - 3, y + 9.8);

      // 3. Value Banner (Solid Black)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(0, 0, 0); // Solid Black
      if (batch.type === 'WALLET') {
        const amountText = `CARD VALUE: ${batch.amount || item.amount || 100} EGP`;
        doc.text(amountText, x + cardWidth / 2, y + 15.2, { align: 'center' });
      } else {
        const discVal = batch.discountValue || item.discount_value || 10;
        const discType = batch.discountType || item.discount_type || 'PERCENTAGE';
        const discText = `COUPON DISCOUNT: ${discVal}${discType === 'PERCENTAGE' ? '%' : ' EGP'} OFF`;
        doc.text(discText, x + cardWidth / 2, y + 15.2, { align: 'center' });
      }

      // 4. Code Box (High Contrast White Box with Solid Black Border)
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(0, 0, 0); // Solid Black
      doc.setLineWidth(0.5);
      doc.roundedRect(x + 6, y + 18.2, cardWidth - 12, 13.8, 1.5, 1.5, 'FD');

      // Monospace Code in Bold Black
      doc.setFont('courier', 'bold');
      doc.setFontSize(11.5);
      doc.setTextColor(0, 0, 0); // Pure Black
      doc.text(codeStr, x + cardWidth / 2, y + 26.5, { align: 'center' });

      // Subtext below code in Solid Black
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.5);
      doc.setTextColor(0, 0, 0); // Solid Black
      const subLabel = batch.type === 'DISCOUNT' ? 'ENTER COUPON CODE TO APPLY DISCOUNT' : 'SCRATCH OR ENTER CODE TO REDEEM';
      doc.text(subLabel, x + cardWidth / 2, y + 30.5, { align: 'center' });

      // 5. Card Footer (Solid Black on Green)
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.25);
      doc.line(x + 3, y + 41.5, x + cardWidth - 3, y + 41.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(0, 0, 0); // Solid Black
      doc.text('omarmeckawy.com', x + 4, y + 45.2);

      let expStr = 'No Expiry';
      if (item.expires_at) {
        expStr = `Exp: ${new Date(item.expires_at).toLocaleDateString('en-GB')}`;
      }
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0); // Solid Black
      doc.text(expStr, x + cardWidth - 4, y + 45.2, { align: 'right' });
    }
  }

  const cleanName =
    filename ||
    `vouchers-${batch.type.toLowerCase()}-${batch.amount || batch.discountValue || 'batch'}-${Date.now()}.pdf`;

  doc.save(cleanName);
}
