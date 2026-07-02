import React from 'react';
import { Search, Sparkles, AlertTriangle, X, ArrowRight } from 'lucide-react';

const SUGGESTIONS = [
  "I want a phone under $500",
  "Premium headphones with noise cancellation",
  "Looking for an e-reader or tablet under $200",
  "Affordable laptop for everyday productivity"
];

export default function PreferenceInput({
  preference,
  setPreference,
  onSubmit,
  loading,
  error,
  onClearError
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">


      {/* Main Search Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-500" />
          </div>
          <input
            type="text"
            required
            placeholder="Describe what you are looking for (e.g. 'I want a phone under $500')"
            value={preference}
            onChange={(e) => setPreference(e.target.value)}
            disabled={loading}
            className="w-full bg-slate-900/60 border border-slate-800/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 rounded-2xl pl-12 pr-32 py-4 text-base text-slate-100 placeholder-slate-500 transition-all duration-200 outline-none backdrop-blur-md disabled:opacity-50"
          />
          <div className="absolute inset-y-2 right-2 flex items-center">
            <button
              type="submit"
              disabled={loading || !preference.trim()}
              className="h-full px-5 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 active:scale-98 text-sm font-semibold text-white rounded-xl shadow-lg shadow-indigo-600/10 border border-indigo-400/20 flex items-center gap-1.5 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <span>Match AI</span>
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1.5">
          <span className="text-xs text-slate-500 mr-1 flex items-center gap-1">
            Try: <ArrowRight className="w-3 h-3" />
          </span>
          {SUGGESTIONS.map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => !loading && setPreference(suggestion)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-full bg-slate-900/30 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700/80 text-slate-400 hover:text-indigo-300 transition-all duration-150 disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </form>

      {/* Error Message Box */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-950/40 border border-rose-900/40 text-rose-200 text-sm animate-fade-in relative">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Query Failed:</span> {error}
          </div>
          <button
            type="button"
            onClick={onClearError}
            className="text-rose-400 hover:text-rose-200 transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
