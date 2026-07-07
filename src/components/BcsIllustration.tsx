type BcsGroup = 'emaciated' | 'thin' | 'ideal' | 'overweight' | 'obese';

function bcsToGroup(bcs: number): BcsGroup {
  if (bcs <= 2) return 'emaciated';
  if (bcs <= 4) return 'thin';
  if (bcs === 5) return 'ideal';
  if (bcs <= 7) return 'overweight';
  return 'obese';
}

const STROKE: Record<BcsGroup, string> = {
  emaciated:  '#dc2626',
  thin:       '#ea580c',
  ideal:      '#16a34a',
  overweight: '#d97706',
  obese:      '#b91c1c',
};

const FILL: Record<BcsGroup, string> = {
  emaciated:  '#fef2f2',
  thin:       '#fff7ed',
  ideal:      '#f0fdf4',
  overweight: '#fffbeb',
  obese:      '#fef2f2',
};

const GROUP_LABEL: Record<BcsGroup, string> = {
  emaciated:  'Emaciated',
  thin:       'Thin',
  ideal:      'Ideal',
  overweight: 'Overweight',
  obese:      'Obese',
};

/* ── Dog profiles ─────────────────────────────────────────────
   Side view, dog faces right. ViewBox 0 0 205 110.
   Key: body torso path changes per BCS group.
   Depth increases dramatically (10px → 60px) as BCS rises.
   ──────────────────────────────────────────────────────────── */
const DOG_TORSO: Record<BcsGroup, string> = {
  // Extremely narrow — almost no body depth, spine bumps visible
  emaciated:
    'M 30,47 C 58,43 82,40 96,37 L 100,32 L 104,36 C 116,35 128,35 136,36 C 142,37 146,40 147,45 L 147,53 C 140,54 112,54 88,54 C 65,54 45,53 33,52 C 30,52 29,50 30,47 Z',
  // Lean with clear upward waist tuck toward the rear
  thin:
    'M 30,45 C 60,36 96,32 128,34 C 138,35 144,39 146,45 L 146,65 C 141,68 122,69 103,69 C 83,69 61,67 46,64 C 38,62 31,58 30,54 C 29,51 29,48 30,45 Z',
  // Balanced — slight but definite waist tuck, smooth back
  ideal:
    'M 30,43 C 62,33 98,30 130,33 C 140,34 146,38 148,44 L 148,72 C 143,75 123,77 103,77 C 83,77 61,74 46,70 C 37,67 31,63 30,58 C 29,54 29,49 30,43 Z',
  // Rounder — belly descends, tuck almost gone
  overweight:
    'M 30,41 C 62,30 100,27 133,30 C 142,31 148,36 150,43 L 150,80 C 144,85 124,87 103,88 C 82,88 60,85 44,81 C 36,78 30,73 29,66 C 27,59 27,51 30,41 Z',
  // Pendulous belly, fat deposits on back, no tuck
  obese:
    'M 29,38 C 62,25 103,21 136,25 C 146,27 153,33 154,41 L 154,89 C 148,97 127,100 105,101 C 83,101 59,97 42,92 C 33,88 27,81 25,72 C 23,63 23,52 29,38 Z',
};

function DogSvg({ group }: { group: BcsGroup }) {
  const s = STROKE[group];
  const f = FILL[group];
  const torso = DOG_TORSO[group];

  const legTop: Record<BcsGroup, number> = { emaciated: 52, thin: 67, ideal: 75, overweight: 86, obese: 97 };
  const lt = legTop[group];

  return (
    <svg viewBox="0 0 205 110" className="w-full h-full" aria-label={`Dog BCS: ${GROUP_LABEL[group]}`}>
      {/* ── Tail (left side, curves up) ── */}
      <path
        d={group === 'obese'
          ? 'M 28,68 C 16,60 10,50 14,40 C 17,33 22,30 22,30'
          : 'M 30,50 C 17,43 9,35 13,26 C 16,20 21,18 21,18'}
        fill="none" stroke={s} strokeWidth="2.5" strokeLinecap="round"
      />

      {/* ── Body torso ── */}
      <path d={torso} fill={f} stroke={s} strokeWidth="2" strokeLinejoin="round" />

      {/* ── Rib lines (thin / emaciated) ── */}
      {(group === 'emaciated' || group === 'thin') && [86, 100, 114].map(x => (
        <line key={x}
          x1={x} y1={group === 'emaciated' ? 38 : 36}
          x2={x - 5} y2={group === 'emaciated' ? 53 : 67}
          stroke={s} strokeWidth="1.2" opacity="0.55" strokeLinecap="round"
        />
      ))}

      {/* ── Spine bumps (emaciated only) ── */}
      {group === 'emaciated' && [100, 120].map(x => (
        <ellipse key={x} cx={x} cy={33} rx={2.5} ry={2} fill={s} opacity="0.7" />
      ))}

      {/* ── Hip bone marker (emaciated) ── */}
      {group === 'emaciated' && (
        <path d="M 30,47 L 24,42 M 30,47 L 24,50" stroke={s} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      )}

      {/* ── Hind legs ── */}
      <rect x={45}  y={lt} width={9} height={16} rx={4} fill={f} stroke={s} strokeWidth="1.5" />
      <rect x={57}  y={lt} width={9} height={16} rx={4} fill={f} stroke={s} strokeWidth="1.5" />

      {/* ── Front legs ── */}
      <rect x={128} y={lt} width={9} height={16} rx={4} fill={f} stroke={s} strokeWidth="1.5" />
      <rect x={140} y={lt} width={9} height={16} rx={4} fill={f} stroke={s} strokeWidth="1.5" />

      {/* ── Head (skull ellipse) ── */}
      <ellipse cx={164} cy={49} rx={group === 'obese' ? 17 : 15} ry={14} fill={f} stroke={s} strokeWidth="1.8" />

      {/* ── Muzzle ── */}
      <path
        d="M 162,55 C 168,54 178,55 178,60 C 178,65 170,66 163,64 C 159,62 161,57 162,55 Z"
        fill={f} stroke={s} strokeWidth="1.5"
      />

      {/* ── Ear (floppy) ── */}
      <path
        d="M 153,38 C 148,33 145,43 148,55 C 152,58 155,55 155,50"
        fill={f} stroke={s} strokeWidth="1.8" strokeLinecap="round"
      />

      {/* ── Eye ── */}
      <circle cx={168} cy={46} r={2} fill={s} />

      {/* ── Nose ── */}
      <ellipse cx={178} cy={59} rx={2.5} ry={2} fill={s} />
    </svg>
  );
}

/* ── Cat profiles ─────────────────────────────────────────────
   Side view, cat faces right. ViewBox 0 0 185 110.
   Cats have rounder skulls, pointed ears, longer tail.
   ──────────────────────────────────────────────────────────── */
const CAT_TORSO: Record<BcsGroup, string> = {
  emaciated:
    'M 28,46 C 55,42 78,39 96,37 L 100,32 L 104,36 C 115,35 125,36 132,38 C 138,39 141,43 141,48 L 141,55 C 135,56 108,56 85,56 C 63,56 44,55 31,54 C 28,53 27,50 28,46 Z',
  thin:
    'M 28,44 C 56,36 88,32 118,34 C 128,35 135,39 138,44 L 138,63 C 133,66 112,67 90,67 C 68,67 48,65 36,62 C 29,60 27,56 27,51 C 26,48 27,47 28,44 Z',
  ideal:
    'M 27,42 C 56,33 88,30 118,32 C 128,33 135,38 138,44 L 138,71 C 132,75 111,77 88,77 C 65,77 46,74 34,70 C 28,67 26,63 26,57 C 25,52 25,48 27,42 Z',
  overweight:
    'M 27,40 C 56,29 90,26 120,28 C 131,29 138,34 141,41 L 141,80 C 134,86 112,89 88,89 C 64,89 44,86 31,81 C 24,78 22,72 22,64 C 21,56 21,49 27,40 Z',
  obese:
    'M 25,37 C 55,24 92,20 123,23 C 134,24 142,30 145,38 L 145,90 C 138,99 114,102 88,103 C 62,103 40,99 26,93 C 18,89 16,81 15,70 C 13,59 14,50 25,37 Z',
};

function CatSvg({ group }: { group: BcsGroup }) {
  const s = STROKE[group];
  const f = FILL[group];
  const torso = CAT_TORSO[group];

  const legTop: Record<BcsGroup, number> = { emaciated: 54, thin: 65, ideal: 75, overweight: 87, obese: 99 };
  const lt = legTop[group];

  return (
    <svg viewBox="0 0 185 110" className="w-full h-full" aria-label={`Cat BCS: ${GROUP_LABEL[group]}`}>
      {/* ── Tail (long, curves up behind) ── */}
      <path
        d={group === 'obese'
          ? 'M 25,72 C 10,65 5,55 8,42 C 10,35 15,30 15,30'
          : 'M 27,48 C 12,40 6,30 10,20 C 13,14 18,11 18,11'}
        fill="none" stroke={s} strokeWidth="2.5" strokeLinecap="round"
      />

      {/* ── Body torso ── */}
      <path d={torso} fill={f} stroke={s} strokeWidth="2" strokeLinejoin="round" />

      {/* ── Rib lines (thin / emaciated) ── */}
      {(group === 'emaciated' || group === 'thin') && [82, 96, 110].map(x => (
        <line key={x}
          x1={x} y1={group === 'emaciated' ? 38 : 36}
          x2={x - 4} y2={group === 'emaciated' ? 55 : 65}
          stroke={s} strokeWidth="1.2" opacity="0.55" strokeLinecap="round"
        />
      ))}

      {/* ── Spine bumps (emaciated) ── */}
      {group === 'emaciated' && [100, 118].map(x => (
        <ellipse key={x} cx={x} cy={33} rx={2.5} ry={2} fill={s} opacity="0.7" />
      ))}

      {/* ── Abdominal fat pad marker (overweight / obese) ── */}
      {(group === 'overweight' || group === 'obese') && (
        <ellipse
          cx={85} cy={group === 'obese' ? 100 : 88}
          rx={group === 'obese' ? 22 : 16} ry={group === 'obese' ? 6 : 4}
          fill={s} opacity="0.15" stroke={s} strokeWidth="1" strokeDasharray="3 2"
        />
      )}

      {/* ── Hind legs ── */}
      <rect x={42} y={lt} width={9} height={14} rx={4} fill={f} stroke={s} strokeWidth="1.5" />
      <rect x={54} y={lt} width={9} height={14} rx={4} fill={f} stroke={s} strokeWidth="1.5" />

      {/* ── Front legs ── */}
      <rect x={120} y={lt} width={9} height={14} rx={4} fill={f} stroke={s} strokeWidth="1.5" />
      <rect x={132} y={lt} width={9} height={14} rx={4} fill={f} stroke={s} strokeWidth="1.5" />

      {/* ── Head (round skull) ── */}
      <ellipse cx={157} cy={47} rx={16} ry={15} fill={f} stroke={s} strokeWidth="1.8" />

      {/* ── Pointy ears ── */}
      <polygon points="145,36 150,22 156,35" fill={f} stroke={s} strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points="158,34 163,20 168,34" fill={f} stroke={s} strokeWidth="1.5" strokeLinejoin="round" />

      {/* ── Muzzle (shorter, rounder than dog) ── */}
      <path
        d="M 157,53 C 161,52 170,53 170,58 C 170,62 163,63 157,61 C 153,59 154,55 157,53 Z"
        fill={f} stroke={s} strokeWidth="1.5"
      />

      {/* ── Eye ── */}
      <ellipse cx={160} cy={44} rx={2.5} ry={2} fill={s} />

      {/* ── Nose ── */}
      <path d="M 163,57 L 166,55 L 169,57 L 166,59 Z" fill={s} opacity="0.8" />

      {/* ── Whisker lines ── */}
      <line x1={170} y1={57} x2={180} y2={55} stroke={s} strokeWidth="0.8" opacity="0.5" />
      <line x1={170} y1={59} x2={180} y2={60} stroke={s} strokeWidth="0.8" opacity="0.5" />
    </svg>
  );
}

/* ── Feature labels shown beneath illustration ─────────────── */
const FEATURE_LABELS: Record<BcsGroup, { dog: string[]; cat: string[] }> = {
  emaciated: {
    dog: ['Ribs & spine visible', 'No fat cover', 'Severe muscle loss'],
    cat: ['Ribs & spine visible', 'No fat cover', 'Prominent bony features'],
  },
  thin: {
    dog: ['Ribs easily felt', 'Clear waist tuck', 'Hip bones visible'],
    cat: ['Ribs easily felt', 'Clear waist visible', 'Minimal fat cover'],
  },
  ideal: {
    dog: ['Ribs felt with thin fat layer', 'Visible waist from above', 'Slight abdominal tuck'],
    cat: ['Ribs felt with slight fat', 'Waist visible from above', 'Minimal abdominal fat pad'],
  },
  overweight: {
    dog: ['Ribs hard to feel', 'Waist barely visible', 'Rounded belly'],
    cat: ['Ribs hard to feel', 'Waist barely visible', 'Moderate belly fat pad'],
  },
  obese: {
    dog: ['Ribs cannot be felt', 'No waist present', 'Pendulous abdomen'],
    cat: ['Ribs cannot be felt', 'No waist present', 'Large hanging belly pad'],
  },
};

/* ── Public component ──────────────────────────────────────── */
interface BcsIllustrationProps {
  bcs: number;
  species: 'dog' | 'cat';
}

export default function BcsIllustration({ bcs, species }: BcsIllustrationProps) {
  const group = bcsToGroup(bcs);
  const s = STROKE[group];
  const features = FEATURE_LABELS[group][species];

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Illustration */}
      <div className="w-full" style={{ maxHeight: 88 }}>
        {species === 'dog' ? <DogSvg group={group} /> : <CatSvg group={group} />}
      </div>

      {/* Feature bullets */}
      <ul className="w-full space-y-1 mt-1">
        {features.map(f => (
          <li key={f} className="flex items-center gap-1.5 text-xs" style={{ color: s }}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s }} />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
