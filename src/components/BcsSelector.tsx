import BcsIllustration from './BcsIllustration';

interface BcsSelectorProps {
  value: number | '';
  onChange: (bcs: number) => void;
  species: 'dog' | 'cat';
}

const BCS_DATA: Record<number, {
  label: string;
  color: string;
  bg: string;
  ring: string;
  text: string;
  dog: string;
  cat: string;
  status: string;
}> = {
  1: {
    label: 'Emaciated',
    color: 'text-red-700', bg: 'bg-red-100', ring: 'ring-red-500', text: 'text-red-700',
    status: 'Severely Underweight',
    dog: 'Ribs, spine, and hip bones are visible from a distance. No fat cover anywhere on the body. Severe muscle loss is obvious.',
    cat: 'Ribs, spine, and hip bones are all highly visible. Extremely prominent bony features with no muscle mass.',
  },
  2: {
    label: 'Very Thin',
    color: 'text-red-600', bg: 'bg-red-50', ring: 'ring-red-400', text: 'text-red-700',
    status: 'Severely Underweight',
    dog: 'Ribs are easily visible with no fat cover. Very prominent hip bones and spine. Obvious waist. Little muscle mass.',
    cat: 'Ribs clearly visible, prominent spine, obvious loss of muscle. Very little fat anywhere.',
  },
  3: {
    label: 'Thin',
    color: 'text-orange-600', bg: 'bg-orange-50', ring: 'ring-orange-400', text: 'text-orange-700',
    status: 'Underweight',
    dog: 'Ribs easily felt and may be visible. Hip bones and spine are visible. Clear waist when viewed from above. Obvious tuck behind ribs.',
    cat: 'Ribs easily felt with minimal fat. Obvious waist. Slight abdominal tuck. Spine and pelvis visible.',
  },
  4: {
    label: 'Slightly Thin',
    color: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-400', text: 'text-amber-700',
    status: 'Slightly Underweight',
    dog: 'Ribs easily felt with minimal fat covering. Waist visible from above. Slight tuck when viewed from the side.',
    cat: 'Ribs easily felt with minimal fat. Slight waist visible. Minimal abdominal fat pad.',
  },
  5: {
    label: 'Ideal',
    color: 'text-green-600', bg: 'bg-green-50', ring: 'ring-green-500', text: 'text-green-700',
    status: 'Ideal Weight',
    dog: 'Ribs easily felt with a thin layer of fat. Waist visible behind the ribs from above. Slight tuck when viewed from the side. Ideal!',
    cat: 'Ribs felt easily with slight fat cover. Minimal abdominal fat pad. Waist visible from above. Ideal!',
  },
  6: {
    label: 'Slightly Overweight',
    color: 'text-yellow-600', bg: 'bg-yellow-50', ring: 'ring-yellow-400', text: 'text-yellow-700',
    status: 'Slightly Overweight',
    dog: 'Ribs felt with slight excess fat. Waist is visible but not prominent. Slight rounding of the belly.',
    cat: 'Ribs felt with slight excess fat. Waist discernible but not prominent. Slight abdominal fat pad present.',
  },
  7: {
    label: 'Overweight',
    color: 'text-orange-600', bg: 'bg-orange-50', ring: 'ring-orange-400', text: 'text-orange-700',
    status: 'Overweight',
    dog: 'Ribs difficult to feel under moderate fat. Waist barely visible from above. Rounded belly. Fat deposits noticeable over spine.',
    cat: 'Ribs difficult to feel. Waist barely visible. Moderate abdominal fat pad. Fat deposits on face and limbs.',
  },
  8: {
    label: 'Obese',
    color: 'text-red-600', bg: 'bg-red-50', ring: 'ring-red-400', text: 'text-red-700',
    status: 'Obese',
    dog: 'Ribs very difficult to feel under heavy fat. No waist visible. Pronounced rounding of the belly. Heavy fat deposits.',
    cat: 'Ribs very difficult to feel. No waist present. Prominent abdominal fat pad. Heavy fat deposits on face, limbs, and spine.',
  },
  9: {
    label: 'Severely Obese',
    color: 'text-red-700', bg: 'bg-red-100', ring: 'ring-red-600', text: 'text-red-800',
    status: 'Severely Obese',
    dog: 'Ribs impossible to feel under massive fat deposits. No waist. Pendulous abdomen. Fat deposits on neck, limbs, and face. Veterinary care needed.',
    cat: 'Ribs cannot be felt. Massive fat deposits everywhere. Pendulous abdomen. Breathing may be affected. Veterinary care needed.',
  },
};

const STATUS_BAR = [
  { scores: [1, 2], label: 'Underweight', color: 'bg-red-400' },
  { scores: [3, 4], label: 'Thin', color: 'bg-orange-400' },
  { scores: [5], label: 'Ideal', color: 'bg-green-400' },
  { scores: [6, 7], label: 'Overweight', color: 'bg-amber-400' },
  { scores: [8, 9], label: 'Obese', color: 'bg-red-500' },
];

export default function BcsSelector({ value, onChange, species }: BcsSelectorProps) {
  const selected = value !== '' ? BCS_DATA[value as number] : null;

  return (
    <div className="space-y-3">
      {/* Status bar legend */}
      <div className="flex rounded-lg overflow-hidden h-2">
        {STATUS_BAR.map(s => (
          <div
            key={s.label}
            className={`${s.color} flex-1`}
            title={s.label}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-400 px-0.5">
        <span>Underweight</span>
        <span className="text-green-600 font-medium">Ideal</span>
        <span>Obese</span>
      </div>

      {/* Number buttons */}
      <div className="grid grid-cols-9 gap-1.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(score => {
          const d = BCS_DATA[score];
          const isSelected = value === score;
          return (
            <button
              key={score}
              type="button"
              onClick={() => onChange(score)}
              className={`
                flex flex-col items-center justify-center py-2.5 rounded-xl border-2 transition-all font-bold text-sm
                ${isSelected
                  ? `${d.bg} ${d.ring} ring-2 border-transparent scale-105 shadow-md`
                  : `bg-white border-gray-100 text-gray-400 hover:border-gray-300 hover:text-gray-600`
                }
              `}
              title={`BCS ${score} — ${d.label}`}
            >
              <span className={isSelected ? d.color : 'text-gray-500'}>{score}</span>
            </button>
          );
        })}
      </div>

      {/* Description card + illustration */}
      {selected ? (
        <div className={`rounded-xl border p-4 ${selected.bg} transition-all`}>
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-lg font-extrabold ${selected.color}`}>BCS {value}/9</span>
            <span className={`text-sm font-semibold ${selected.color}`}>— {selected.status}</span>
          </div>
          <div className="flex gap-4 items-start">
            {/* SVG illustration */}
            <div className="w-44 flex-shrink-0">
              <BcsIllustration bcs={value as number} species={species} />
            </div>
            {/* Text */}
            <div className="flex-1 space-y-2">
              <p className={`text-sm leading-relaxed ${selected.text} opacity-90`}>
                {species === 'cat' ? selected.cat : selected.dog}
              </p>
              {(value === 1 || value === 2 || value === 8 || value === 9) && (
                <p className={`text-xs font-semibold ${selected.text}`}>
                  ⚠️ Veterinary evaluation is recommended at this body condition score.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-200 p-4 text-center text-sm text-gray-400">
          Select a number above — BCS 5 is ideal for most pets
        </div>
      )}

      <p className="text-xs text-gray-400 leading-relaxed">
        <strong>Not sure?</strong> Feel along your pet's ribcage. At an ideal weight (BCS 5) you should feel ribs easily, like feeling your knuckles through a thin layer of skin.
        Ask your vet at your next visit if unsure.
      </p>
    </div>
  );
}
