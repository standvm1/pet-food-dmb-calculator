import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, BookOpen, ChevronDown } from 'lucide-react';

const calcLinks = [
  { to: '/feeding-calculator', label: '🍽️ How Much Should I Feed?', desc: 'General daily feeding amounts' },
  { to: '/weight-loss-calculator', label: '📉 Weight Loss Calculator', desc: 'Safe plan for overweight pets' },
  { to: '/weight-gain-calculator', label: '📈 Weight Gain Calculator', desc: 'Help underweight pets safely' },
];

const conditionLinks = [
  { to: '/renal-calculator', label: '💧 Kidney / CKD', desc: 'IRIS stage phosphorus & protein targets' },
  { to: '/diabetes-calculator', label: '🩸 Diabetes', desc: 'Carb % DMB & feeding for diabetic pets' },
  { to: '/low-fat-calculator', label: '🔥 Pancreatitis / Low-Fat', desc: 'Fat DMB & g/1000 kcal assessment' },
  { to: '/hepatic-calculator', label: '🛡️ Hepatic / Liver Disease', desc: 'Protein targets & copper-breed flag' },
  { to: '/cardiac-calculator', label: '❤️ Cardiac / Heart Disease', desc: 'Sodium mg/100kcal & DCM risk' },
  { to: '/urinary-calculator', label: '🚿 Urinary Stone Prevention', desc: 'Water intake & pH targets by stone type' },
  { to: '/omega3-calculator', label: '🐟 Omega-3 / EPA+DHA Dosing', desc: 'Daily fish oil target by condition' },
  { to: '/elimination-diet', label: '🌿 Elimination Diet Planner', desc: 'Novel protein options & trial guidance' },
];

const learnLinks = [
  { to: '/what-is-dmb', label: 'What is Dry Matter Basis?' },
  { to: '/how-to-compare', label: 'How to Compare Foods' },
  { to: '/cat-protein', label: 'Protein in Cat Food' },
  { to: '/low-fat-dog', label: 'Low-Fat Dog Food' },
  { to: '/kidney-diet', label: 'Kidney Diet Guide' },
  { to: '/puppy-nutrition', label: 'Puppy & Kitten Nutrition' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [conditionOpen, setConditionOpen] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/avh-logo.png"
              alt="Atlas Veterinary Hospital"
              className="w-10 h-10 object-contain flex-shrink-0"
            />
            <div className="leading-tight">
              <div className="font-bold text-gray-900 text-sm sm:text-base leading-none">Pet Food DMB Calculator</div>
              <div className="text-xs text-gray-500 hidden sm:block">Atlas Veterinary Hospital</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/'
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              DMB Calculator
            </Link>

            {/* Calculators dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setCalcOpen(true)}
              onMouseLeave={() => setCalcOpen(false)}
            >
              <button
                className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  calcLinks.some(l => l.to === location.pathname)
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Feeding Calculators <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {calcOpen && (
                <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                  {calcLinks.map(link => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`block px-4 py-3 transition-colors ${
                        location.pathname === link.to
                          ? 'bg-teal-50 text-teal-700'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-teal-700'
                      }`}
                    >
                      <div className="text-sm font-medium">{link.label}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{link.desc}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Condition Calculators dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setConditionOpen(true)}
              onMouseLeave={() => setConditionOpen(false)}
            >
              <button
                className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  conditionLinks.some(l => l.to === location.pathname)
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Condition Calculators <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {conditionOpen && (
                <div className="absolute left-0 top-full mt-1 w-72 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                  {conditionLinks.map(link => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`block px-4 py-2.5 transition-colors ${
                        location.pathname === link.to
                          ? 'bg-teal-50 text-teal-700'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-teal-700'
                      }`}
                    >
                      <div className="text-sm font-medium">{link.label}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{link.desc}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Learn dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setLearnOpen(true)}
              onMouseLeave={() => setLearnOpen(false)}
            >
              <button
                className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  learnLinks.some(l => l.to === location.pathname)
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Learn <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {learnOpen && (
                <div className="absolute left-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                  {learnLinks.map(link => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`block px-4 py-2.5 text-sm transition-colors ${
                        location.pathname === link.to
                          ? 'bg-teal-50 text-teal-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-teal-700'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/food-search"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/food-search'
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Food Search
            </Link>

            <Link
              to="/contact"
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                location.pathname === '/contact'
                  ? 'bg-teal-600 text-white'
                  : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
              }`}
            >
              Subscribe Free
            </Link>
          </nav>

          {/* CTA + Mobile menu button */}
          <div className="flex items-center gap-2">
            <a
              href="tel:9092226682"
              className="hidden sm:flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              909-222-6682
            </a>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            {[
              { to: '/', label: 'DMB Calculator' },
              { to: '/feeding-calculator', label: '🍽️ Feeding Calculator' },
              { to: '/weight-loss-calculator', label: '📉 Weight Loss Calculator' },
              { to: '/weight-gain-calculator', label: '📈 Weight Gain Calculator' },
              ...conditionLinks.map(l => ({ to: l.to, label: l.label })),
              ...learnLinks,
              { to: '/food-search', label: 'Food Search' },
              { to: '/contact', label: '✉️ Subscribe Free' },
            ].map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 px-4">
              <a
                href="tel:9092226682"
                className="flex items-center justify-center gap-1.5 bg-teal-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg"
                onClick={() => setMenuOpen(false)}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Call Atlas Veterinary: 909-222-6682
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
