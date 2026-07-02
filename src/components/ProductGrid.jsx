import React from 'react';
import ProductCard from './ProductCard';

export default function ProductGrid({ products, recommendedIds, isSearched }) {
  const activeIds = Array.isArray(recommendedIds) ? recommendedIds : [];

  // Filter products: if searched, only show recommended ones. Otherwise show all.
  const displayProducts = isSearched
    ? products.filter(product => activeIds.includes(product.id))
    : products;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
      {displayProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isRecommended={activeIds.includes(product.id)}
        />
      ))}
    </div>
  );
}
