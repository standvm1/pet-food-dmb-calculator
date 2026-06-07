import { useState } from 'react';
import { Download, Mail } from 'lucide-react';
import jsPDF from 'jspdf';
import type { FoodInput, DMBResult, FeedingResult } from '../types';
import { round1 } from '../utils/calculations';

// ── Hospital constants ────────────────────────────────────────────────────────
const HOSPITAL = {
  name: 'Atlas Veterinary Hospital',
  address: '3744 Towne Center Drive, La Verne CA 91750',
  phone: '909-222-6682',
  website: 'atlasveterinaryhospital.com',
  color: [13, 148, 136] as [number, number, number],   // teal-600
  colorLight: [240, 253, 250] as [number, number, number], // teal-50
};

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 15;
const CONTENT_W = PAGE_W - MARGIN * 2; // 180
const FOOTER_H = 14; // reserved at bottom of every page
const HEADER_H = 38;

interface PdfReportButtonProps {
  food: FoodInput;
  result: DMBResult;
  label?: string;
  feedingResult?: FeedingResult | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function addPageFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  const y = PAGE_H - FOOTER_H + 4;

  // Thin teal rule
  doc.setDrawColor(...HOSPITAL.color);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, y - 2, PAGE_W - MARGIN, y - 2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);

  const line1 = `${HOSPITAL.name}  ·  ${HOSPITAL.address}  ·  ${HOSPITAL.phone}  ·  ${HOSPITAL.website}`;
  doc.text(line1, PAGE_W / 2, y + 2, { align: 'center' });
  doc.text(`Page ${pageNum} of ${totalPages}`, PAGE_W - MARGIN, y + 2, { align: 'right' });
  doc.text('For educational purposes only — not a substitute for veterinary advice', PAGE_W / 2, y + 7, { align: 'center' });
}

function drawTableSection(
  doc: jsPDF,
  title: string,
  rows: [string, string][],
  y: number,
  colX: [number, number],
  rowH: number,
  checkOverflow: (doc: jsPDF, y: number, needed: number) => number
): number {
  y = checkOverflow(doc, y, 10 + rows.length * rowH + 4);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(title, MARGIN, y);
  y += 5;

  // Header row
  doc.setFillColor(...HOSPITAL.colorLight);
  doc.rect(MARGIN, y, CONTENT_W, rowH, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(MARGIN, y, CONTENT_W, rowH);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Field', colX[0] + 2, y + 4.5);
  doc.text('Value', colX[1] + 2, y + 4.5);
  doc.line(colX[1], y, colX[1], y + rowH);
  y += rowH;

  rows.forEach(([field, value], i) => {
    if (i % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(MARGIN, y, CONTENT_W, rowH, 'F');
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(field, colX[0] + 2, y + 4.5);
    doc.setTextColor(...HOSPITAL.color);
    doc.text(value, colX[1] + 2, y + 4.5);
    doc.setDrawColor(226, 232, 240);
    doc.rect(MARGIN, y, CONTENT_W, rowH);
    doc.line(colX[1], y, colX[1], y + rowH);
    y += rowH;
  });

  return y;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PdfReportButton({ food, result, label = 'Food', feedingResult }: PdfReportButtonProps) {
  const [loading, setLoading] = useState(false);

  const generatePdf = async () => {
    setLoading(true);
    try {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      // Track pages for footer
      let currentPage = 1;
      const usableBottom = PAGE_H - FOOTER_H - 4;

      // Add a new page and reset y, incrementing currentPage
      const addPage = () => {
        doc.addPage();
        currentPage++;
        return HEADER_H + 6;
      };

      // Check if there's enough room; if not, add a page
      const checkOverflow = (_doc: jsPDF, y: number, needed: number): number => {
        if (y + needed > usableBottom) {
          return addPage();
        }
        return y;
      };

      // ── Header ──────────────────────────────────────────────────────────────
      doc.setFillColor(...HOSPITAL.color);
      doc.rect(0, 0, PAGE_W, HEADER_H, 'F');

      // Try logo
      try {
        const logoResp = await fetch('/avh-logo.png');
        const logoBlob = await logoResp.blob();
        const logoDataUrl = await new Promise<string>(res => {
          const reader = new FileReader();
          reader.onload = () => res(reader.result as string);
          reader.readAsDataURL(logoBlob);
        });
        doc.addImage(logoDataUrl, 'PNG', 8, 5, 26, 26);
      } catch { /* logo unavailable — skip */ }

      const textX = 38;
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Pet Food Dry Matter Basis Report', textX, 13);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(HOSPITAL.name, textX, 21);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`${HOSPITAL.phone}  ·  ${HOSPITAL.address}`, textX, 27);
      doc.text(`${HOSPITAL.website}  ·  Generated: ${date}`, textX, 33);

      doc.setTextColor(15, 23, 42);

      // ── Food info ────────────────────────────────────────────────────────────
      let y = HEADER_H + 8;
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}: ${food.name || 'Unnamed Food'}`, MARGIN, y);

      y += 6;
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      const infoLine = [
        `Species: ${food.species === 'dog' ? 'Dog' : 'Cat'}`,
        `Food type: ${food.foodType}`,
        food.dietGoal ? `Diet goal: ${food.dietGoal.replace(/-/g, ' ')}` : null,
      ].filter(Boolean).join('  ·  ');
      doc.text(infoLine, MARGIN, y);
      doc.setTextColor(15, 23, 42);

      const colX: [number, number] = [MARGIN, MARGIN + 100];
      const rowH = 7;

      // ── DMB Results ──────────────────────────────────────────────────────────
      y += 10;
      const dmRows: [string, string][] = [
        ['Moisture (as-fed)', `${food.moisture}%`],
        ['Dry Matter', `${round1(result.dryMatterPercent)}%`],
        ['Crude Protein (as-fed)', `${food.protein}%`],
        ['Crude Protein (DMB)', `${round1(result.proteinDMB)}%`],
        ['Crude Fat (as-fed)', `${food.fat}%`],
        ['Crude Fat (DMB)', `${round1(result.fatDMB)}%`],
        ['Crude Fiber (as-fed)', `${food.fiber}%`],
        ['Crude Fiber (DMB)', `${round1(result.fiberDMB)}%`],
        [
          result.ashEstimated ? 'Ash (estimated, as-fed)' : 'Ash (as-fed)',
          result.ashEstimated ? `~${food.foodType === 'canned' ? '2.5' : '7'}%` : `${food.ash}%`,
        ],
        ...(result.ashDMB != null ? [['Ash (DMB)', `${round1(result.ashDMB)}%`] as [string, string]] : []),
        [result.carbsCalculated ? 'Carbohydrates (calc., as-fed)' : 'Carbohydrates (as-fed)', `${round1(result.carbsAsFed)}%`],
        ['Carbohydrates (DMB)', `${round1(result.carbsDMB)}%`],
      ];
      y = drawTableSection(doc, 'Dry Matter Basis Results', dmRows, y, colX, rowH, checkOverflow);

      // ── Calories ─────────────────────────────────────────────────────────────
      const calRows: [string, string][] = [];
      if (food.calories !== '') calRows.push(['Calories', `${food.calories} ${food.caloriesUnit}`]);
      if (food.kcalPerKg !== '') calRows.push(['Caloric Density', `${food.kcalPerKg} kcal/kg`]);
      if (calRows.length > 0) {
        y += 8;
        y = drawTableSection(doc, 'Calorie Information', calRows, y, colX, rowH, checkOverflow);
      }

      // ── Feeding calculator ───────────────────────────────────────────────────
      if (feedingResult) {
        const weightLbs = food.petWeightUnit === 'lbs' ? Number(food.petWeight) : Number(food.petWeight) * 2.205;
        const formatScenario = (s: typeof feedingResult.scenarios.maintenance) => {
          let str = `${s.kcalPerDay} kcal/day`;
          if (s.gramsPerDay !== null) str += ` (${Math.round(s.gramsPerDay)} g/day)`;
          else if (s.unitsPerDay !== null) str += ` (${s.unitsPerDay.toFixed(2)} ${feedingResult.unitLabel})`;
          return str;
        };

        const feedRows: [string, string][] = [
          ['Current Weight', `${weightLbs.toFixed(1)} lbs (${feedingResult.currentWeightKg.toFixed(1)} kg)`],
          ['Ideal Weight (estimated)', `${feedingResult.idealWeightLbs.toFixed(1)} lbs (${feedingResult.idealWeightKg.toFixed(1)} kg)`],
          ['Body Condition Score', `${food.bodyConditionScore} / 9 — ${feedingResult.bcsStatus.replace(/-/g, ' ')}`],
          ['RER at current weight', `${feedingResult.rerCurrentKcal} kcal/day`],
          ['RER at ideal weight', `${feedingResult.rerIdealKcal} kcal/day`],
          ['Maintenance (MER)', `${feedingResult.merMaintenanceKcal} kcal/day`],
          ['Active Weight Loss', formatScenario(feedingResult.scenarios.aggressiveWeightLoss)],
          ['Moderate Weight Loss', formatScenario(feedingResult.scenarios.moderateWeightLoss)],
          ['Maintenance', formatScenario(feedingResult.scenarios.maintenance)],
          ['Moderate Weight Gain', formatScenario(feedingResult.scenarios.moderateWeightGain)],
          ['Active Weight Gain', formatScenario(feedingResult.scenarios.aggressiveWeightGain)],
        ];

        y += 8;
        y = drawTableSection(doc, 'Feeding Calculator Recommendations', feedRows, y, colX, rowH, checkOverflow);
      }

      // ── Mineral nutrients ────────────────────────────────────────────────────
      const advRows: [string, string][] = [];
      if (food.phosphorus !== '') advRows.push(['Phosphorus (as-fed)', `${food.phosphorus}%`]);
      if (food.sodium !== '') advRows.push(['Sodium (as-fed)', `${food.sodium}%`]);
      if (food.calcium !== '') advRows.push(['Calcium (as-fed)', `${food.calcium}%`]);
      if (food.omega3 !== '') advRows.push(['Omega-3 (as-fed)', `${food.omega3}%`]);
      if (advRows.length > 0) {
        y += 8;
        y = drawTableSection(doc, 'Mineral Nutrients', advRows, y, colX, rowH, checkOverflow);
      }

      // ── Warnings ─────────────────────────────────────────────────────────────
      if (result.warnings.length > 0) {
        y = checkOverflow(doc, y, 10 + result.warnings.length * 5 + 4);
        y += 8;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(180, 83, 9);
        doc.text('Warnings', MARGIN, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        result.warnings.forEach(w => {
          doc.text(`• ${w}`, MARGIN + 3, y);
          y += 5;
        });
        doc.setTextColor(15, 23, 42);
      }

      // ── "Bring this to your appointment" CTA ─────────────────────────────────
      y = checkOverflow(doc, y, 28);
      y += 10;

      doc.setFillColor(...HOSPITAL.colorLight);
      doc.setDrawColor(...HOSPITAL.color);
      doc.setLineWidth(0.5);
      doc.roundedRect(MARGIN, y, CONTENT_W, 24, 3, 3, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...HOSPITAL.color);
      doc.text('Bring this report to your next appointment', PAGE_W / 2, y + 7, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(
        'Our veterinary team can review these results and help you choose the best diet for your pet\'s individual needs.',
        PAGE_W / 2, y + 13, { align: 'center' }
      );

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...HOSPITAL.color);
      doc.text(
        `${HOSPITAL.phone}  ·  ${HOSPITAL.website}  ·  ${HOSPITAL.address}`,
        PAGE_W / 2, y + 20, { align: 'center' }
      );

      // ── Disclaimer ───────────────────────────────────────────────────────────
      y = checkOverflow(doc, y, 32);
      y += 10;

      doc.setFillColor(255, 251, 235);
      doc.setDrawColor(253, 230, 138);
      doc.setLineWidth(0.3);
      doc.rect(MARGIN, y, CONTENT_W, 28, 'FD');

      doc.setTextColor(120, 53, 15);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Disclaimer', MARGIN + 4, y + 6);
      doc.setFont('helvetica', 'normal');
      doc.text(
        doc.splitTextToSize(
          'This report is for educational purposes only and does not replace veterinary nutritional advice. ' +
          'Feeding amounts are estimates based on the RER formula and may not account for individual metabolic variation. ' +
          'Pet foods vary by formulation, calories, digestibility, mineral content, and medical suitability. ' +
          'Pets with medical conditions — including kidney disease, diabetes, pancreatitis, urinary disease, ' +
          'or food allergies — should have diet recommendations made by a veterinarian.',
          CONTENT_W - 8
        ),
        MARGIN + 4,
        y + 12
      );

      // ── Footers on all pages ─────────────────────────────────────────────────
      const totalPages = doc.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        addPageFooter(doc, p, totalPages);
      }

      doc.save(`avh-dmb-report-${Date.now()}.pdf`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={generatePdf}
        disabled={loading}
        className="flex items-center gap-2 bg-white border border-gray-200 hover:border-teal-300 hover:bg-teal-50 text-gray-700 hover:text-teal-700 font-medium px-4 py-2 rounded-xl text-sm transition-colors disabled:opacity-60"
      >
        <Download className="w-4 h-4" />
        {loading ? 'Generating…' : 'Download PDF Report'}
      </button>
      <button
        onClick={() => alert('Download the PDF report and attach it to an email to your veterinarian, or bring it to your appointment at Atlas Veterinary Hospital (909-222-6682).')}
        className="flex items-center gap-2 bg-white border border-gray-200 hover:border-teal-300 hover:bg-teal-50 text-gray-700 hover:text-teal-700 font-medium px-4 py-2 rounded-xl text-sm transition-colors"
      >
        <Mail className="w-4 h-4" />
        Email to My Vet
      </button>
    </div>
  );
}
