import { ExternalLink, Star, Beaker } from 'lucide-react';
import type { FoodItem } from '../types';

interface FoodCardProps {
  food: FoodItem;
}

export default function FoodCard({ food }: FoodCardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Sponsored banner */}
      {food.sponsored && (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-1.5 flex items-center gap-1.5">
          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Sponsored</span>
        </div>
      )}

      <div className="p-4">
        {/* Brand + Name */}
        <div className="mb-3">
          <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">{food.brand}</div>
          <h3 className="font-bold text-gray-900 text-sm leading-tight">{food.productName}</h3>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            food.species === 'dog' ? 'bg-amber-100 text-amber-700' :
            food.species === 'cat' ? 'bg-purple-100 text-purple-700' :
            'bg-gray-100 text-gray-600'
          }`}>
            {food.species === 'both' ? 'Dog & Cat' : food.species === 'dog' ? '🐕 Dog' : '🐈 Cat'}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            food.foodType === 'dry' ? 'bg-orange-100 text-orange-700' : 'bg-teal-100 text-teal-700'
          }`}>
            {food.foodType === 'dry' ? '🥣 Dry' : food.foodType === 'canned' ? '🥫 Canned' : food.foodType}
          </span>
          {food.isPrescription && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700 flex items-center gap-1">
              <Beaker className="w-3 h-3" /> Rx
            </span>
          )}
        </div>

        {/* DMB Nutrients */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: 'Protein', value: food.proteinDMB, color: 'text-teal-700' },
            { label: 'Fat', value: food.fatDMB, color: 'text-orange-600' },
            { label: 'Fiber', value: food.fiberDMB, color: 'text-emerald-600' },
          ].map(n => (
            <div key={n.label} className="bg-gray-50 rounded-xl p-2.5 text-center">
              <div className={`text-base font-bold ${n.color}`}>{n.value.toFixed(1)}%</div>
              <div className="text-xs text-gray-500 mt-0.5">{n.label} DMB</div>
            </div>
          ))}
        </div>

        {/* kcal + moisture */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <span>{food.kcalPerKg.toLocaleString()} kcal/kg</span>
          <span>·</span>
          <span>{food.moisture}% moisture</span>
        </div>

        {/* Description */}
        {food.description && (
          <p className="text-xs text-gray-500 leading-relaxed mb-3">{food.description}</p>
        )}

        {/* Tags */}
        {food.dietTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {food.dietTags.map(tag => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
        )}

        {/* CTA */}
        {(food.affiliateUrl || food.purchaseUrl) && (
          <a
            href={food.affiliateUrl || food.purchaseUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex items-center justify-center gap-1.5 w-full border border-teal-200 text-teal-700 font-semibold text-sm py-2 rounded-xl hover:bg-teal-50 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Product
          </a>
        )}
      </div>
    </div>
  );
}
