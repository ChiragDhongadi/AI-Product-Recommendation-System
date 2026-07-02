import React from 'react';
import { Smartphone, Laptop, Headphones, Tablet, BookOpen, Sparkles, Cpu, Watch, Speaker, Gamepad2, Keyboard } from 'lucide-react';

export default function ProductCard({ product, isRecommended }) {
  const { name, category, price, blurb } = product;

  // Choose the appropriate icon for the product category
  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Phone':
        return <Smartphone className="w-4 h-4 text-indigo-400" />;
      case 'Laptop':
        return <Laptop className="w-4 h-4 text-indigo-400" />;
      case 'Headphones':
        return <Headphones className="w-4 h-4 text-indigo-400" />;
      case 'Tablet':
        return <Tablet className="w-4 h-4 text-indigo-400" />;
      case 'E-reader':
        return <BookOpen className="w-4 h-4 text-indigo-400" />;
      case 'Smartwatch':
        return <Watch className="w-4 h-4 text-indigo-400" />;
      case 'Speaker':
        return <Speaker className="w-4 h-4 text-indigo-400" />;
      case 'Gaming':
        return <Gamepad2 className="w-4 h-4 text-indigo-400" />;
      case 'Accessories':
        return <Keyboard className="w-4 h-4 text-indigo-400" />;
      default:
        return <Cpu className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div
      className={`relative flex flex-col justify-between p-6 rounded-2xl border transition-all duration-300 group hover:-translate-y-1 ${
        isRecommended
          ? 'bg-slate-900/90 border-indigo-500/80 recommended-glow ring-1 ring-indigo-500/20'
          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
      }`}
    >
      {/* Sparkle Badge for Recommended items */}
      {isRecommended && (
        <div className="absolute -top-3 right-4 flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-indigo-500 to-pink-500 text-xs font-bold text-white rounded-full shadow-lg shadow-indigo-500/20 border border-indigo-400/30 animate-pulse">
          <Sparkles className="w-3 h-3" />
          <span>AI Match</span>
        </div>
      )}

      <div>
        {/* Category Header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="p-1.5 rounded-lg bg-slate-800/85 border border-slate-700/50 flex items-center justify-center">
            {getCategoryIcon(category)}
          </span>
          <span className="text-xs font-medium tracking-wide text-slate-400 uppercase">
            {category}
          </span>
        </div>

        {/* Product Name */}
        <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-300 transition-colors mb-2">
          {name}
        </h3>

        {/* Blurb */}
        <p className="text-sm text-slate-400 leading-relaxed mb-6">
          {blurb}
        </p>
      </div>

      {/* Pricing Footer */}
      <div className="flex items-baseline justify-between mt-auto pt-4 border-t border-slate-800/60">
        <span className="text-xs text-slate-500">Price</span>
        <span className="text-2xl font-extrabold text-white">
          ${price}
        </span>
      </div>
    </div>
  );
}
