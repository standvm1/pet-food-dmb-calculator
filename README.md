# Pet Food Dry Matter Basis Calculator

A modern, mobile-friendly web application that helps pet owners understand and compare pet food labels using dry matter basis (DMB) calculations.

Built with **React + TypeScript + Tailwind CSS v4 + Vite**.

---

## Getting Started

### Prerequisites
- Node.js 18+ (20+ recommended)
- npm

### Install and run locally

```bash
cd pet-food-dmb-calculator
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

### Build for production

```bash
npm run build
npm run preview
```

The `dist/` folder contains the production-ready static site, ready to deploy to Netlify, Vercel, or any static host.

---

## Project Structure

```
src/
├── components/
│   ├── CalculatorForm.tsx        # Main nutrient input form
│   ├── ResultsTable.tsx          # DMB results display + interpretation
│   ├── FoodComparisonExample.tsx # Static dry vs. canned example
│   ├── DietGoalInfo.tsx          # Educational content per diet goal
│   ├── FoodSearch.tsx            # Browse/filter food database
│   ├── FoodCard.tsx              # Individual food item card
│   ├── AdvancedSection.tsx       # Optional: phosphorus, sodium, pet weight, etc.
│   ├── Header.tsx                # Sticky navigation
│   ├── Footer.tsx
│   ├── Disclaimer.tsx            # Educational disclaimer
│   ├── AdSlot.tsx                # Placeholder for display ads
│   ├── EmailCapture.tsx          # Email subscription form
│   └── PdfReportButton.tsx       # Download PDF report (jsPDF)
├── pages/
│   ├── Home.tsx                  # Calculator + side-by-side comparison
│   ├── WhatIsDMB.tsx             # SEO: what is dry matter basis
│   ├── HowToCompare.tsx          # SEO: how to compare foods
│   ├── FoodSearchPage.tsx        # Browse food database
│   ├── CatProtein.tsx            # SEO: protein in cat food
│   └── LowFatDog.tsx             # SEO: low-fat dog food
├── utils/
│   └── calculations.ts           # Core DMB calculation logic
├── data/
│   └── mockFoodDatabase.ts       # Sample food database (JSON)
└── types/
    └── index.ts                  # Shared TypeScript types
```

---

## Core Calculation

Located in `src/utils/calculations.ts`.

```typescript
calculateDryMatterBasis({
  moisture,   // required: 0–99
  protein,    // required
  fat,        // required
  fiber,      // required
  ash,        // optional — defaults: 2.5% (canned), 7% (dry)
  carbs,      // optional — estimated by NFE if omitted
  foodType,   // 'dry' | 'canned' | 'semi-moist' | 'treat' | 'home-cooked'
})
```

Returns:

```typescript
{
  dryMatterPercent,
  proteinDMB,
  fatDMB,
  fiberDMB,
  ashDMB,
  carbsAsFed,
  carbsDMB,
  ashEstimated,     // true if ash was defaulted
  carbsCalculated,  // true if carbs were estimated by NFE
  warnings,         // non-fatal validation messages
  errors,           // fatal validation errors
}
```

### Carbohydrate estimation (NFE method)
If carbs are not entered:
```
Carbs (as-fed) = 100 − protein − fat − fiber − moisture − ash
```

### Example
- Canned food: protein 10%, moisture 78%
- Dry Matter = 100 − 78 = **22%**
- Protein DMB = (10 ÷ 22) × 100 = **45.5%**

---

## Customizing for Your Hospital

### Branding
- Update the site name and logo in `Header.tsx` and `Footer.tsx`
- Update the hero headline in `src/pages/Home.tsx`
- Add your phone number / email to the nutrition consult CTA in `Home.tsx`
- Add your logo to `public/` and reference it in `Header.tsx`
- Primary color: find/replace `teal` with your brand color throughout `src/`

### Contact Links
Search for `href="tel:"` and `href="mailto:"` in `Footer.tsx` and `Home.tsx` to add your hospital's contact info.

---

## Monetization Integration Points

### Display Ads (Google AdSense or similar)
`AdSlot` components are placed at strategic positions. Replace the placeholder in `src/components/AdSlot.tsx` with your ad network script tag.

Current placements:
- `Home.tsx` — above calculator (banner)
- `Home.tsx` — below email capture (rectangle)
- `FoodSearchPage.tsx` — top of food search (banner)

### Affiliate / Sponsored Listings
In `src/data/mockFoodDatabase.ts`, each `FoodItem` has:
- `sponsored: boolean` — shows a "Sponsored" badge
- `affiliateUrl: string` — used for the "View Product" button
- `purchaseUrl: string` — direct link fallback

Sponsored foods always appear before regular results in `FoodSearch.tsx`.

### Email Capture
`EmailCapture.tsx` has a placeholder `handleSubmit`. Replace with your email provider's API:
- Mailchimp: POST to `/mailchimp/subscribe`
- ConvertKit: use their form embed API
- Klaviyo / Drip: similar REST endpoints

### PDF Reports with Hospital Branding
`PdfReportButton.tsx` uses **jsPDF**. Customize the `generatePdf()` function to add your hospital name, address, logo, and phone number.

---

## Future API / Search Integration

`FoodSearch.tsx` currently uses `mockFoods` from `src/data/mockFoodDatabase.ts`. To connect live data:

1. Replace the import with a `fetch()` call to your API
2. Use **React Query** or **SWR** for loading states and caching
3. Potential data sources:
   - Pet food manufacturer nutrition pages
   - Veterinary diet databases (Purina, Hill's, Royal Canin APIs)
   - Google Custom Search API
   - Your own curated SQL/PostgreSQL database

Each `FoodItem` has `dietTags`, `isPrescription`, `species`, `foodType` fields already designed for backend filtering.

---

## SEO Content Pages

| Route | Title |
|---|---|
| `/what-is-dmb` | What is Dry Matter Basis? |
| `/how-to-compare` | How to Compare Wet and Dry Pet Food |
| `/cat-protein` | Protein in Cat Food: As-Fed vs Dry Matter Basis |
| `/low-fat-dog` | Low-Fat Dog Food: What Does Fat % Really Mean? |

Add `react-helmet-async` to inject custom `<title>` and `<meta description>` tags per page for full SEO control.

---

## Deployment

This is a Vite SPA. Deploy to:
- **Netlify** — drag `dist/` to netlify.com/drop or connect GitHub
- **Vercel** — `vercel` CLI or GitHub integration
- **GitHub Pages** — add `base: '/repo-name/'` to `vite.config.ts`
- **Any static host** — upload the `dist/` directory

---

## Disclaimer

This application is for **educational purposes only**. It does not replace professional veterinary nutritional advice. Pets with medical conditions should have diet recommendations made by a veterinarian.
