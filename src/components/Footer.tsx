import { Link } from 'react-router-dom';
import { Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <img src="/avh-logo.png" alt="Atlas Veterinary Hospital" className="w-12 h-12 object-contain flex-shrink-0" />
              <div>
                <div className="font-bold text-gray-900 text-sm leading-tight">Atlas Veterinary Hospital</div>
                <div className="text-xs text-gray-500">Pet Food DMB Calculator</div>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Educational tool for pet owners to better understand pet food labels. Built with veterinary guidance.
            </p>
          </div>

          {/* Learn */}
          <div>
            <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Learn</div>
            <ul className="space-y-2">
              {[
                { to: '/what-is-dmb', label: 'What is Dry Matter Basis?' },
                { to: '/how-to-compare', label: 'How to Compare Pet Foods' },
                { to: '/cat-protein', label: 'Protein in Cat Food' },
                { to: '/low-fat-dog', label: 'Low-Fat Dog Food Explained' },
                { to: '/kidney-diet', label: 'Kidney Diet Guide' },
                { to: '/puppy-nutrition', label: 'Puppy & Kitten Nutrition' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-xs text-gray-500 hover:text-teal-600 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact / CTA */}
          <div>
            <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Atlas Veterinary Hospital</div>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
              Have nutrition questions? Our team at Atlas Veterinary Hospital can help tailor a diet to your pet's specific needs.
            </p>
            <a
              href="tel:9092226682"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700"
            >
              <Phone className="w-3.5 h-3.5" />
              909-222-6682
            </a>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Atlas Veterinary Hospital. For educational purposes only.
          </p>
          <p className="text-xs text-gray-400">Built with veterinary guidance.</p>
        </div>
      </div>
    </footer>
  );
}
