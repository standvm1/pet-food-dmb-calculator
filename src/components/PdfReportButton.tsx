import { useState } from 'react';
import { Download, Mail } from 'lucide-react';
import jsPDF from 'jspdf';
import type { FoodInput, DMBResult, FeedingResult } from '../types';
import { round1 } from '../utils/calculations';

interface PdfReportButtonProps {
  food: FoodInput;
  result: DMBResult;
  label?: string;
  feedingResult?: FeedingResult | null;
}

function drawTableSection(
  doc: jsPDF,
  title: string,
  rows: [string, string][],
  y: number,
  colX: [number, number],
  rowH: number
): number {
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(title, 15, y);
  y += 5;

  doc.setFillColor(240, 253, 250);
  doc.rect(15, y, 175, rowH, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, y, 175, rowH);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Field', colX[0] + 2, y + 4.5);
  doc.text('Value', colX[1] + 2, y + 4.5);
  doc.line(colX[1], y, colX[1], y + rowH);
  y += rowH;

  rows.forEach(([field, value], i) => {
    if (i % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y, 175, rowH, 'F');
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(field, colX[0] + 2, y + 4.5);
    doc.setTextColor(13, 148, 136);
    doc.text(value, colX[1] + 2, y + 4.5);
    doc.setDrawColor(226, 232, 240);
    doc.rect(15, y, 175, rowH);
    doc.line(colX[1], y, colX[1], y + rowH);
    y += rowH;
  });

  return y;
}

export default function PdfReportButton({ food, result, label = 'Food', feedingResult }: PdfReportButtonProps) {
  const [loading, setLoading] = useState(false);

  const generatePdf = async () => {
    setLoading(true);
    try {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      // Header
      doc.setFillColor(13, 148, 136);
      doc.rect(0, 0, 210, 32, 'F');

      try {
        const logoResp = await fetch('/avh-logo.png');
        const logoBlob = await logoResp.blob();
        const logoDataUrl = await new Promise<string>(res => {
          const reader = new FileReader();
          reader.onload = () => res(reader.result as string);
          reader.readAsDataURL(logoBlob);
        });
        doc.addImage(logoDataUrl, 'PNG', 8, 4, 24, 24);
      } catch { /* skip if unavailable */ }

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Pet Food Dry Matter Basis Report', 36, 13);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Atlas Veterinary Hospital  ·  909-222-6682  ·  Generated: ${date}`, 36, 24);
      doc.setTextColor(15, 23, 42);

      // Food info
      let y = 44;
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}: ${food.name || 'Unnamed Food'}`, 15, y);

      y += 7;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      const infoLine = [
        `Species: ${food.species === 'dog' ? 'Dog' : 'Cat'}`,
        `Food type: ${food.foodType}`,
        food.dietGoal ? `Diet goal: ${food.dietGoal}` : null,
      ].filter(Boolean).join('  |  ');
      doc.text(infoLine, 15, y);
      doc.setTextColor(15, 23, 42);

      // DMB Results table
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
        [result.ashDMB != null ? 'Ash (DMB)' : '', result.ashDMB != null ? `${round1(result.ashDMB)}%` : ''],
        [result.carbsCalculated ? 'Carbohydrates (calc., as-fed)' : 'Carbohydrates (as-fed)', `${round1(result.carbsAsFed)}%`],
        ['Carbohydrates (DMB)', `${round1(result.carbsDMB)}%`],
      ].filter(r => r[0] !== '') as [string, string][];

      y = drawTableSection(doc, 'Dry Matter Basis Results', dmRows, y, [15, 110], 7);

      // Calorie info
      const calRows: [string, string][] = [];
      if (food.calories !== '') calRows.push(['Calories', `${food.calories} ${food.caloriesUnit}`]);
      if (food.kcalPerKg !== '') calRows.push(['kcal/kg', `${food.kcalPerKg} kcal/kg`]);
      if (calRows.length > 0) {
        y += 8;
        y = drawTableSection(doc, 'Calorie Information', calRows, y, [15, 110], 7);
      }

      // Feeding calculator results
      if (feedingResult) {
        y += 8;
        const weightLbs = food.petWeightUnit === 'lbs' ? Number(food.petWeight) : Number(food.petWeight) * 2.205;
        const feedRows: [string, string][] = [
          ['Current Weight', `${weightLbs.toFixed(1)} lbs (${feedingResult.currentWeightKg.toFixed(1)} kg)`],
          ['Ideal Weight (est.)', `${feedingResult.idealWeightLbs.toFixed(1)} lbs (${feedingResult.idealWeightKg.toFixed(1)} kg)`],
          ['Body Condition Score', `${food.bodyConditionScore} / 9`],
          ['RER at current weight', `${feedingResult.rerCurrentKcal} kcal/day`],
          ['RER at ideal weight', `${feedingResult.rerIdealKcal} kcal/day`],
          ['Maintenance (MER)', `${feedingResult.merMaintenanceKcal} kcal/day`],
        ];

        const { aggressiveWeightLoss, moderateWeightLoss, maintenance, moderateWeightGain, aggressiveWeightGain } = feedingResult.scenarios;

        const formatScenario = (s: typeof maintenance) => {
          let str = `${s.kcalPerDay} kcal/day`;
          if (s.gramsPerDay !== null) str += ` (${Math.round(s.gramsPerDay)}g/day)`;
          else if (s.unitsPerDay !== null) str += ` (${s.unitsPerDay.toFixed(2)} ${feedingResult.unitLabel})`;
          return str;
        };

        feedRows.push(
          ['Active Weight Loss', formatScenario(aggressiveWeightLoss)],
          ['Moderate Weight Loss', formatScenario(moderateWeightLoss)],
          ['Maintenance', formatScenario(maintenance)],
          ['Moderate Weight Gain', formatScenario(moderateWeightGain)],
          ['Active Weight Gain', formatScenario(aggressiveWeightGain)],
        );

        y = drawTableSection(doc, 'Feeding Calculator Recommendations', feedRows, y, [15, 110], 7);
      }

      // Mineral nutrients
      const advRows: [string, string][] = [];
      if (food.phosphorus !== '') advRows.push(['Phosphorus (as-fed)', `${food.phosphorus}%`]);
      if (food.sodium !== '') advRows.push(['Sodium (as-fed)', `${food.sodium}%`]);
      if (food.calcium !== '') advRows.push(['Calcium (as-fed)', `${food.calcium}%`]);
      if (food.omega3 !== '') advRows.push(['Omega-3 (as-fed)', `${food.omega3}%`]);

      if (advRows.length > 0) {
        y += 8;
        y = drawTableSection(doc, 'Mineral Nutrients', advRows, y, [15, 110], 7);
      }

      // Warnings
      if (result.warnings.length > 0) {
        y += 8;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(180, 83, 9);
        doc.text('Warnings', 15, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        result.warnings.forEach(w => {
          doc.text(`• ${w}`, 18, y);
          y += 5;
        });
        doc.setTextColor(15, 23, 42);
      }

      // Disclaimer
      y += 10;
      const disclaimerH = 26;
      doc.setFillColor(255, 251, 235);
      doc.rect(15, y, 175, disclaimerH, 'F');
      doc.setTextColor(120, 53, 15);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Disclaimer', 19, y + 6);
      doc.setFont('helvetica', 'normal');
      doc.text(
        doc.splitTextToSize(
          'This report is for educational purposes only and does not replace veterinary nutritional advice. ' +
          'Feeding amounts are estimates based on the RER formula and may not account for individual metabolic variation. ' +
          'Pet foods vary by formulation, calories, digestibility, mineral content, and medical suitability. ' +
          'Pets with medical conditions should have diet recommendations made by a veterinarian.',
          167
        ),
        19,
        y + 12
      );

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
        {loading ? 'Generating…' : 'Download PDF'}
      </button>
      <button
        onClick={() => alert('To email results, download the PDF and attach it to an email to your veterinarian.')}
        className="flex items-center gap-2 bg-white border border-gray-200 hover:border-teal-300 hover:bg-teal-50 text-gray-700 hover:text-teal-700 font-medium px-4 py-2 rounded-xl text-sm transition-colors"
      >
        <Mail className="w-4 h-4" />
        Email to My Vet
      </button>
    </div>
  );
}
