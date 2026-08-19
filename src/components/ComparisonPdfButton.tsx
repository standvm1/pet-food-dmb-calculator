import { useState } from 'react';
import { FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import type { FoodInput, DMBResult } from '../types';
import { round1 } from '../utils/calculations';

const HOSPITAL = {
  name: 'Atlas Veterinary Hospital',
  address: '3744 Towne Center Drive, La Verne CA 91750',
  phone: '909-222-6682',
  website: 'atlasveterinaryhospital.com',
  color: [13, 148, 136] as [number, number, number],
  colorLight: [240, 253, 250] as [number, number, number],
};

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 15;
const CONTENT_W = PAGE_W - MARGIN * 2;
const FOOTER_H = 14;

interface Props {
  foodA: FoodInput;
  foodB: FoodInput;
  resultA: DMBResult;
  resultB: DMBResult;
}

function footer(doc: jsPDF, page: number, total: number) {
  const y = PAGE_H - FOOTER_H + 4;
  doc.setDrawColor(...HOSPITAL.color);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, y - 2, PAGE_W - MARGIN, y - 2);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`${HOSPITAL.name}  ·  ${HOSPITAL.address}  ·  ${HOSPITAL.phone}  ·  ${HOSPITAL.website}`, PAGE_W / 2, y + 2, { align: 'center' });
  doc.text(`Page ${page} of ${total}`, PAGE_W - MARGIN, y + 2, { align: 'right' });
  doc.text('For educational purposes only — not a substitute for veterinary advice', PAGE_W / 2, y + 7, { align: 'center' });
}

export default function ComparisonPdfButton({ foodA, foodB, resultA, resultB }: Props) {
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const usableBottom = PAGE_H - FOOTER_H - 4;

      const nameA = foodA.name || 'Food A';
      const nameB = foodB.name || 'Food B';

      // Truncate text with jsPDF's own metrics so nothing bleeds into the next column.
      const fit = (text: string, maxW: number) => {
        if (doc.getTextWidth(text) <= maxW) return text;
        let t = text;
        while (t.length > 1 && doc.getTextWidth(t + '...') > maxW) t = t.slice(0, -1);
        return t.trimEnd() + '...';
      };

      // ── Header ──────────────────────────────────────────────────────────────
      doc.setFillColor(...HOSPITAL.color);
      doc.rect(0, 0, PAGE_W, 38, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text(HOSPITAL.name, MARGIN, 15);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(204, 245, 240);
      doc.text('Pet Food Comparison Report', MARGIN, 22);
      doc.text(date, PAGE_W - MARGIN, 22, { align: 'right' });

      doc.setFontSize(8);
      doc.text(`${HOSPITAL.phone}  ·  ${HOSPITAL.website}`, MARGIN, 28);
      doc.text(fit(`${nameA}  vs.  ${nameB}`, CONTENT_W - 62), PAGE_W - MARGIN, 28, { align: 'right' });

      let y = 48;
      const ROW_H = 8;
      const HALF = CONTENT_W / 2 - 2;

      // ── Side-by-side food label columns ─────────────────────────────────────
      const drawFoodColumn = (food: FoodInput, result: DMBResult, name: string, xOff: number, accentRgb: [number, number, number]) => {
        const asFedX = xOff + HALF - 32;  // right edge of the as-fed column
        const dmbX   = xOff + HALF - 2;   // right edge of the dry matter column
        const labelW = HALF - 62;

        // Column header
        doc.setFillColor(...accentRgb);
        doc.rect(xOff, y, HALF, 9, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.text(fit(name, HALF - 6), xOff + 3, y + 6);

        let cy = y + 9;

        // Sub-header so each number is clearly as-fed vs. dry matter
        doc.setFillColor(241, 245, 249);
        doc.rect(xOff, cy, HALF, 6, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.rect(xOff, cy, HALF, 6);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139);
        doc.text('AS FED (LABEL)', asFedX, cy + 4, { align: 'right' });
        doc.text('DRY MATTER', dmbX, cy + 4, { align: 'right' });
        cy += 6;

        const rows: { label: string; asFed: string; dmb: string }[] = [
          { label: 'Food type',     asFed: food.foodType.charAt(0).toUpperCase() + food.foodType.slice(1), dmb: '' },
          { label: 'Moisture',      asFed: `${food.moisture}%`, dmb: '' },
          { label: 'Dry matter',    asFed: `${round1(result.dryMatterPercent)}%`, dmb: '' },
          { label: 'Crude protein', asFed: `${food.protein}%`, dmb: `${round1(result.proteinDMB)}%` },
          { label: 'Crude fat',     asFed: `${food.fat}%`,     dmb: `${round1(result.fatDMB)}%` },
          { label: 'Crude fiber',   asFed: `${food.fiber}%`,   dmb: `${round1(result.fiberDMB)}%` },
          { label: 'Carbohydrates', asFed: '',                 dmb: `${round1(result.carbsDMB)}%` },
        ];

        if (food.ash !== '') rows.push({ label: 'Ash', asFed: `${food.ash}%`, dmb: `${round1(result.ashDMB ?? 0)}%` });
        if (food.kcalPerKg !== '') rows.push({ label: 'Caloric density', asFed: `${Number(food.kcalPerKg).toLocaleString()} kcal/kg`, dmb: '' });

        rows.forEach((r, i) => {
          if (i % 2 === 0) {
            doc.setFillColor(248, 250, 252);
            doc.rect(xOff, cy, HALF, ROW_H, 'F');
          }
          doc.setDrawColor(226, 232, 240);
          doc.rect(xOff, cy, HALF, ROW_H);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(71, 85, 105);
          doc.text(fit(r.label, labelW), xOff + 2, cy + 5);

          if (r.asFed) {
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(71, 85, 105);
            doc.text(fit(r.asFed, 28), asFedX, cy + 5, { align: 'right' });
          }
          if (r.dmb) {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...accentRgb);
            doc.text(fit(r.dmb, 28), dmbX, cy + 5, { align: 'right' });
          }
          cy += ROW_H;
        });

        return cy;
      };

      const TEAL: [number, number, number] = [13, 148, 136];
      const INDIGO: [number, number, number] = [99, 102, 241];

      const colAX = MARGIN;
      const colBX = MARGIN + HALF + 4;

      const endA = drawFoodColumn(foodA, resultA, nameA, colAX, TEAL);
      const endB = drawFoodColumn(foodB, resultB, nameB, colBX, INDIGO);
      y = Math.max(endA, endB) + 8;

      // ── Comparison summary table ─────────────────────────────────────────────
      if (y + 60 > usableBottom) { doc.addPage(); y = MARGIN + 10; }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('Dry Matter Basis Comparison', MARGIN, y);
      y += 6;

      // Column header
      doc.setFillColor(...HOSPITAL.colorLight);
      doc.rect(MARGIN, y, CONTENT_W, ROW_H, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(MARGIN, y, CONTENT_W, ROW_H);

      const C1 = MARGIN + 2;
      const C2 = MARGIN + 45;
      const C3 = MARGIN + 87;
      const C4 = MARGIN + 129;
      const C5 = MARGIN + 152;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text('Nutrient', C1, y + 5);
      doc.text(fit(nameA, C3 - C2 - 3), C2, y + 5);
      doc.text(fit(nameB, C4 - C3 - 3), C3, y + 5);
      doc.text('Difference', C4, y + 5);
      doc.text('Better', C5, y + 5);
      [C2, C3, C4, C5].forEach(cx => doc.line(cx - 2, y, cx - 2, y + ROW_H));
      y += ROW_H;

      const compRows: [string, number, number, boolean][] = [
        ['Crude Protein DMB', resultA.proteinDMB, resultB.proteinDMB, true],
        ['Crude Fat DMB', resultA.fatDMB, resultB.fatDMB, false],
        ['Crude Fiber DMB', resultA.fiberDMB, resultB.fiberDMB, false],
        ['Carbohydrates DMB', resultA.carbsDMB, resultB.carbsDMB, false],
      ];

      let aWins = 0, bWins = 0;

      compRows.forEach(([label, vA, vB, higherBetter], i) => {
        if (i % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(MARGIN, y, CONTENT_W, ROW_H, 'F');
        }
        doc.setDrawColor(226, 232, 240);
        doc.rect(MARGIN, y, CONTENT_W, ROW_H);
        [C2, C3, C4, C5].forEach(cx => doc.line(cx - 2, y, cx - 2, y + ROW_H));

        const diff = Math.abs(vA - vB);
        const aIsBetter = higherBetter ? vA > vB : vA < vB;
        const bIsBetter = higherBetter ? vB > vA : vB < vA;
        const winnerText = diff < 0.1 ? 'Tied' : aIsBetter ? nameA : nameB;
        if (diff >= 0.1) { aIsBetter ? aWins++ : bWins++; }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(15, 23, 42);
        doc.text(label, C1, y + 5);

        doc.setTextColor(...TEAL);
        doc.text(`${round1(vA)}%`, C2, y + 5);
        doc.setTextColor(...INDIGO);
        doc.text(`${round1(vB)}%`, C3, y + 5);
        doc.setTextColor(71, 85, 105);
        doc.text(`${diff < 0.1 ? '~0' : (vA > vB ? '+' : '-') + round1(diff)}%`, C4, y + 5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(diff < 0.1 ? 100 : aIsBetter || bIsBetter ? (aIsBetter ? TEAL[0] : INDIGO[0]) : 100,
                         diff < 0.1 ? 116 : aIsBetter ? TEAL[1] : INDIGO[1],
                         diff < 0.1 ? 139 : aIsBetter ? TEAL[2] : INDIGO[2]);
        doc.text(fit(winnerText, PAGE_W - MARGIN - C5), C5, y + 5);
        y += ROW_H;
      });

      y += 6;

      // Overall verdict
      if (y + 14 > usableBottom) { doc.addPage(); y = MARGIN + 10; }
      const overallWinner = aWins > bWins ? nameA : bWins > aWins ? nameB : null;
      doc.setFillColor(...HOSPITAL.colorLight);
      doc.setDrawColor(...HOSPITAL.color);
      doc.setLineWidth(0.5);
      doc.roundedRect(MARGIN, y, CONTENT_W, 12, 2, 2, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...HOSPITAL.color);
      const verdict = overallWinner
        ? `Overall: ${overallWinner} wins more nutrient categories on a dry matter basis.`
        : 'Overall: These foods are nutritionally similar on a dry matter basis.';
      doc.text(verdict, PAGE_W / 2, y + 8, { align: 'center' });
      y += 18;

      // Calorie comparison
      const hasKcalA = foodA.kcalPerKg !== '' && Number(foodA.kcalPerKg) > 0;
      const hasKcalB = foodB.kcalPerKg !== '' && Number(foodB.kcalPerKg) > 0;
      if (hasKcalA && hasKcalB) {
        if (y + 20 > usableBottom) { doc.addPage(); y = MARGIN + 10; }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text('Caloric Density', MARGIN, y);
        y += 6;

        const kcalA = Number(foodA.kcalPerKg);
        const kcalB = Number(foodB.kcalPerKg);

        doc.setFillColor(248, 250, 252);
        doc.rect(MARGIN, y, CONTENT_W, ROW_H, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.rect(MARGIN, y, CONTENT_W, ROW_H);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text(`${nameA}:`, C1, y + 5);
        doc.setTextColor(...TEAL);
        doc.setFont('helvetica', 'bold');
        doc.text(`${kcalA.toLocaleString()} kcal/kg`, C1 + 30, y + 5);
        doc.setTextColor(71, 85, 105);
        doc.setFont('helvetica', 'normal');
        doc.text(`${nameB}:`, C3, y + 5);
        doc.setTextColor(...INDIGO);
        doc.setFont('helvetica', 'bold');
        doc.text(`${kcalB.toLocaleString()} kcal/kg`, C3 + 30, y + 5);
        y += ROW_H + 6;
      }

      // ── Disclaimer ───────────────────────────────────────────────────────────
      if (y + 24 > usableBottom) { doc.addPage(); y = MARGIN + 10; }
      doc.setFillColor(255, 251, 235);
      doc.setDrawColor(251, 191, 36);
      doc.setLineWidth(0.5);
      doc.roundedRect(MARGIN, y, CONTENT_W, 20, 2, 2, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(146, 64, 14);
      doc.text('Important Disclaimer', MARGIN + 4, y + 6);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(120, 53, 15);
      doc.splitTextToSize(
        'This report is for educational purposes only and does not constitute veterinary advice. ' +
        'Nutritional needs vary by species, age, breed, weight, and medical condition. ' +
        'Always consult a licensed veterinarian before making changes to your pet\'s diet.',
        CONTENT_W - 8
      ).forEach((line: string, i: number) => doc.text(line, MARGIN + 4, y + 12 + i * 4));

      // ── Footers ───────────────────────────────────────────────────────────────
      const totalPages = doc.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        footer(doc, p, totalPages);
      }

      doc.save(`avh-food-comparison-${Date.now()}.pdf`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={generate}
      disabled={loading}
      className="no-print w-full flex items-center justify-center gap-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm px-6 py-3.5 rounded-2xl transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:opacity-60"
    >
      <FileText className="w-5 h-5" />
      {loading ? 'Generating PDF…' : 'Download Food Comparison PDF'}
    </button>
  );
}
