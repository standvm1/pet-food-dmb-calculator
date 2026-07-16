import { useRef, useState } from 'react';
import { Camera, Upload, CheckCircle, AlertTriangle, RotateCcw, X, Loader2, Sparkles } from 'lucide-react';

export interface ScanResult {
  protein: number | null;
  fat: number | null;
  fiber: number | null;
  moisture: number | null;
  ash: number | null;
  phosphorus: number | null;
  kcalPerKg: number | null;
  kcalPerCup: number | null;
  kcalPerCan: number | null;
  confidence: 'high' | 'medium' | 'low';
}

interface Props {
  onApply?: (result: ScanResult) => void;
  accentClass?: string;
}

const MAX_PX = 1024;
const QUALITY = 0.85;

function compressImage(file: File): Promise<{ base64: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, MAX_PX / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/jpeg', QUALITY);
      resolve({ base64: dataUrl.split(',')[1], mediaType: 'image/jpeg' });
    };
    img.onerror = reject;
    img.src = url;
  });
}

function confidenceLabel(c: ScanResult['confidence']) {
  if (c === 'high') return { text: 'High confidence', icon: <CheckCircle className="w-3.5 h-3.5 text-green-500" />, cls: 'text-green-700' };
  if (c === 'medium') return { text: 'Medium confidence — verify values below', icon: <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />, cls: 'text-yellow-700' };
  return { text: 'Low confidence — please verify manually', icon: <AlertTriangle className="w-3.5 h-3.5 text-red-500" />, cls: 'text-red-700' };
}

export default function LabelScanner({ onApply, accentClass = 'focus:ring-teal-400' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const objUrl = URL.createObjectURL(file);
    setPreview(objUrl);
    setResult(null);
    setError(null);
    setApplied(false);
    setLoading(true);

    try {
      const { base64, mediaType } = await compressImage(file);
      const res = await fetch('/.netlify/functions/label-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, mediaType }),
      });
      let data: Record<string, unknown>;
      try {
        data = await res.json();
      } catch {
        const text = await res.text().catch(() => '');
        setError(`Server error (${res.status})${text ? ': ' + text.slice(0, 120) : ''}`);
        return;
      }
      if (data.error) {
        setError(data.error as string);
      } else {
        setResult(data as unknown as ScanResult);
      }
    } catch (err) {
      setError(`Request failed — ${err instanceof Error ? err.message : 'check your connection and try again'}`);
    } finally {
      setLoading(false);
    }
  }

  function handleApply() {
    if (!result || !onApply) return;
    onApply(result);
    setApplied(true);
  }

  function reset() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setResult(null);
    setError(null);
    setApplied(false);
    setLoading(false);
  }

  const hasValues = result && [result.protein, result.fat, result.fiber, result.moisture].some(v => v !== null);

  return (
    <div className="rounded-2xl overflow-hidden border border-teal-200 shadow-sm">
      {/* Camera input (opens camera directly on mobile) */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />
      {/* Gallery/file input (opens photo library or file picker) */}
      <input
        ref={uploadRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {/* Initial state */}
      {!preview && !loading && (
        <div>
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-xl p-1.5 flex-shrink-0">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm leading-tight">Scan the Food Label</div>
                <div className="text-teal-200 text-xs mt-0.5">AI reads the numbers for you automatically</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-teal-300 text-xs flex-shrink-0">
              <Sparkles className="w-3 h-3" />
              <span className="hidden sm:inline">AI-powered</span>
            </div>
          </div>

          {/* Visual guide */}
          <div className="bg-white px-4 py-4 space-y-3">
            {/* Steps */}
            <div className="flex items-start gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-2 flex-1">
                <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
                <span>Flip the bag over to the back</span>
              </div>
              <div className="text-gray-300">→</div>
              <div className="flex items-center gap-2 flex-1">
                <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
                <span>Find the <strong className="text-gray-700">Guaranteed Analysis</strong> box</span>
              </div>
              <div className="text-gray-300">→</div>
              <div className="flex items-center gap-2 flex-1">
                <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
                <span>Take a close, well-lit photo of just that section</span>
              </div>
            </div>

            {/* Example panel */}
            <div className="flex gap-3 items-start">
              <div className="flex-1 rounded-xl border-2 border-teal-400 bg-teal-50 p-3 text-xs">
                <div className="font-bold text-gray-800 mb-1.5 text-xs uppercase tracking-wide">Guaranteed Analysis</div>
                <div className="space-y-0.5 font-mono text-gray-700">
                  <div className="flex justify-between"><span>Crude Protein (min)</span><span className="font-bold">12%</span></div>
                  <div className="flex justify-between"><span>Crude Fat (min)</span><span className="font-bold">5%</span></div>
                  <div className="flex justify-between"><span>Crude Fiber (max)</span><span className="font-bold">1%</span></div>
                  <div className="flex justify-between"><span>Moisture (max)</span><span className="font-bold">78%</span></div>
                </div>
                <div className="mt-2 flex items-center gap-1 text-teal-700 font-semibold">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
                  Photograph this section
                </div>
              </div>
              <div className="flex-shrink-0 text-xs text-gray-400 max-w-[110px] leading-relaxed pt-1">
                <span className="text-red-500 font-semibold">Not</span> the front of the bag or the ingredients list — just the % table above.
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className={`flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 ${accentClass}`}
              >
                <Camera className="w-4 h-4" />
                Take Photo
              </button>
              <button
                type="button"
                onClick={() => uploadRef.current?.click()}
                className={`flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors focus:outline-none focus:ring-2 ${accentClass}`}
              >
                <Upload className="w-4 h-4" />
                Upload Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* After photo taken */}
      {preview && (
        <div className="bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Camera className="w-4 h-4 text-teal-600" />
              Label scan
            </span>
            <button type="button" onClick={reset} className="text-gray-400 hover:text-gray-600 p-0.5">
              <X className="w-4 h-4" />
            </button>
          </div>

          <img src={preview} alt="Label preview" className="w-full max-h-52 object-contain rounded-xl border border-gray-100 bg-gray-50" />

          {loading && (
            <div className="flex items-center justify-center gap-2 text-sm text-teal-700 py-3 bg-teal-50 rounded-xl">
              <Loader2 className="w-4 h-4 animate-spin" />
              Reading label with AI…
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 rounded-xl p-3 border border-red-200">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="space-y-3">
              {(() => {
                const conf = confidenceLabel(result.confidence);
                return (
                  <div className={`flex items-center gap-1.5 text-xs font-medium ${conf.cls}`}>
                    {conf.icon}
                    {conf.text}
                  </div>
                );
              })()}

              {hasValues && (
                <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden text-xs">
                  <div className="grid grid-cols-2">
                    {([
                      ['Moisture', result.moisture, '%'],
                      ['Crude Protein', result.protein, '%'],
                      ['Crude Fat', result.fat, '%'],
                      ['Crude Fiber', result.fiber, '%'],
                      ['Ash', result.ash, '%'],
                      ['Phosphorus', result.phosphorus, '%'],
                      ['kcal/kg', result.kcalPerKg, ''],
                      ['kcal/cup', result.kcalPerCup, ''],
                      ['kcal/can', result.kcalPerCan, ''],
                    ] as const).filter(([, v]) => v !== null).map(([label, val, unit], i) => (
                      <div key={label} className={`px-3 py-2 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-100 last:border-b-0 flex items-center justify-between gap-2`}>
                        <span className="text-gray-500">{label}</span>
                        <span className="font-semibold text-gray-800 tabular-nums">{val}{unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!hasValues && (
                <p className="text-xs text-gray-500 italic text-center py-2">No values could be read — try a clearer, well-lit photo.</p>
              )}

              {hasValues && result.phosphorus === null && (
                <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                  Phosphorus not found on this label — look for "Phosphorus X%" in the Guaranteed Analysis and enter it manually in the calculator.
                </p>
              )}

              <div className="flex items-center gap-2">
                {hasValues && onApply && !applied && (
                  <button
                    type="button"
                    onClick={handleApply}
                    className={`flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-xl transition-colors text-sm focus:outline-none focus:ring-2 ${accentClass}`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Apply to Calculator
                  </button>
                )}
                {hasValues && onApply && applied && (
                  <div className="flex-1 flex items-center justify-center gap-2 text-sm text-green-700 font-bold bg-green-50 rounded-xl py-3 border border-green-200">
                    <CheckCircle className="w-4 h-4" />
                    Applied! Values filled in below.
                  </div>
                )}
                {hasValues && !onApply && (
                  <div className="flex-1 flex items-center justify-center gap-2 text-sm text-teal-700 font-medium bg-teal-50 rounded-xl py-2.5 border border-teal-200">
                    <CheckCircle className="w-4 h-4" />
                    Values for reference — use when speaking with your vet
                  </div>
                )}
                <button
                  type="button"
                  onClick={reset}
                  className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm font-medium py-3 px-3 rounded-xl border border-gray-200 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
