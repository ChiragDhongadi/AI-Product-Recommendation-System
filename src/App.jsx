import React, { useState, useEffect } from 'react';
import { Sparkles, Library, RefreshCw, HelpCircle } from 'lucide-react';
import { getRecommendations, BACKEND_URL } from './lib/getRecommendations';
import PreferenceInput from './components/PreferenceInput';
import ProductGrid from './components/ProductGrid';

export default function App() {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);

  const [preference, setPreference] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendedIds, setRecommendedIds] = useState([]);
  const [aiReason, setAiReason] = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    let active = true;
    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        setProductsError(null);
        const response = await fetch(`${BACKEND_URL}/api/products`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (active) {
          setProducts(data);
        }
      } catch (err) {
        if (active) {
          setProductsError(err.message || 'Failed to communicate with recommendation backend.');
        }
      } finally {
        if (active) {
          setProductsLoading(false);
        }
      }
    };
    loadProducts();
    return () => {
      active = false;
    };
  }, []);

  const handleSearch = async () => {
    if (!preference.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const result = await getRecommendations(preference, products);
      setRecommendedIds(result.ids);
      setAiReason(result.reason);
      setSearched(true);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please verify your connection.');
      setRecommendedIds([]);
      setAiReason('');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRecommendedIds([]);
    setAiReason('');
    setPreference('');
    setSearched(false);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Header section */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6 text-center">

        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            SmartMatch AI
          </span>
        </h1>
        
        <p className="max-w-xl mx-auto text-sm sm:text-base text-slate-400">
          Enter your shopping preferences in natural language. Our AI model will scan the catalog and highlight the absolute best matches for you.
        </p>
      </header>

      {/* Main content section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* Search Panel */}
        <section aria-label="Search and preference panel">
          <PreferenceInput
            preference={preference}
            setPreference={setPreference}
            onSubmit={handleSearch}
            loading={loading}
            error={error}
            onClearError={() => setError(null)}
          />
        </section>

        {/* Results & Grid Section */}
        <section className="space-y-6" aria-label="Catalog and recommendations">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <Library className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-slate-100">Product Catalog</h2>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-850 border border-slate-800/80 text-slate-400 font-semibold">
                {products.length} Items
              </span>
            </div>

            {/* Catalog Info & Reset */}
            {searched && (
              <div className="flex items-center gap-3">
                <button
                  id="reset-button"
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-semibold text-slate-400 hover:text-indigo-450 transition-colors flex items-center gap-1.5 bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/85 px-3 py-1.5 rounded-lg cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Clear Recommendations</span>
                </button>
              </div>
            )}
          </div>

          {/* AI Reasoning Callout */}
          {searched && aiReason && !loading && (
            <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-indigo-200 text-sm flex items-start gap-3 backdrop-blur-sm animate-fade-in">
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-indigo-300">AI Recommendation Reasoning:</span>
                <p className="mt-0.5 text-slate-300 italic">"{aiReason}"</p>
              </div>
            </div>
          )}

          {/* Product Grid or Loading/Error Display */}
          {productsLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-sm text-slate-400 font-medium">Loading products catalog...</p>
            </div>
          ) : productsError ? (
            <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-900/30 text-rose-200 text-center space-y-3 max-w-md mx-auto">
              <p className="font-semibold text-rose-300">Catalog Loading Failed</p>
              <p className="text-xs text-slate-400">{productsError}</p>
              <button
                type="button"
                onClick={async () => {
                  setProductsLoading(true);
                  setProductsError(null);
                  try {
                    const response = await fetch(`${BACKEND_URL}/api/products`);
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    const data = await response.json();
                    setProducts(data);
                  } catch (err) {
                    setProductsError(err.message || 'Failed to communicate with recommendation backend.');
                  } finally {
                    setProductsLoading(false);
                  }
                }}
                className="px-4 py-2 bg-rose-900/40 hover:bg-rose-900/60 border border-rose-800/80 text-xs font-semibold text-rose-200 rounded-xl transition-colors cursor-pointer"
              >
                Retry Connection
              </button>
            </div>
          ) : (
            <ProductGrid
              products={products}
              recommendedIds={recommendedIds}
              isSearched={searched}
            />
          )}
        </section>
      </main>


    </div>
  );
}
