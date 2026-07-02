export const BACKEND_URL = "";

/**
 * Local mock matching engine to demonstrate the application flow
 * when the backend is unreachable.
 */
function getMockRecommendations(preference, products = []) {
  const query = preference.toLowerCase();
  let matchedProducts = [];
  let reason = "";

  // 1. Detect category keyword
  let category = null;
  if (query.includes("phone") || query.includes("mobile")) {
    category = "Phone";
  } else if (query.includes("laptop") || query.includes("computer") || query.includes("notebook")) {
    category = "Laptop";
  } else if (query.includes("headphone") || query.includes("earbud") || query.includes("sound") || query.includes("audio")) {
    category = "Headphones";
  } else if (query.includes("tablet") || query.includes("ipad") || query.includes("tab")) {
    category = "Tablet";
  } else if (query.includes("reader") || query.includes("kindle") || query.includes("book")) {
    category = "E-reader";
  }

  // 2. Detect price limit (e.g. "under $500", "below 100")
  let priceLimit = null;
  const priceRegex = /(?:under|below|less\s+than|budget\s+of)\s*(?:\$)?\s*(\d+)/i;
  const match = query.match(priceRegex);
  if (match) {
    priceLimit = parseInt(match[1], 10);
  }

  // Filter products
  matchedProducts = products.filter(p => {
    let matchesCategory = !category || p.category === category;
    let matchesPrice = !priceLimit || p.price <= priceLimit;
    
    // Extra keyword search
    if (query.includes("cheap") || query.includes("budget")) {
      matchesPrice = matchesPrice && p.price < 200;
    } else if (query.includes("premium") || query.includes("pro") || query.includes("high-end") || query.includes("expensive")) {
      matchesPrice = matchesPrice && p.price > 500;
    }

    return matchesCategory && matchesPrice;
  });

  // If no match found, fall back to standard filters or select 2 items
  if (matchedProducts.length === 0) {
    if (priceLimit) {
      matchedProducts = products.filter(p => p.price <= priceLimit);
    }
    if (matchedProducts.length === 0 && products.length >= 2) {
      // absolute fallback to match something
      matchedProducts = [products[1], products[products.length - 1]];
    }
  }

  const matchedIds = matchedProducts.map(p => p.id);
  const names = matchedProducts.slice(0, 2).map(p => p.name).join(" and ");

  if (category && priceLimit) {
    reason = `Found ${category}s under $${priceLimit}. Highlighted ${names} as the best options matching your budget.`;
  } else if (category) {
    reason = `Filtered for the ${category} category. We suggest ${names} based on their features and customer rating.`;
  } else if (priceLimit) {
    reason = `Identified options priced below $${priceLimit}, highlighting ${names} for their balance of features and cost.`;
  } else {
    reason = `Analyzed your request and selected ${names} as top recommendations.`;
  }

  return {
    ids: matchedIds,
    reason: `[MOCK DEMO] ${reason}`
  };
}

/**
 * Fetches product recommendations by querying the FastAPI backend proxy.
 * If the backend is unreachable, it automatically falls back to client-side mock matching.
 */
export async function getRecommendations(preference, products = []) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/recommend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: preference
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData?.detail || `HTTP error! status: ${response.status}`;
      throw new Error(errMsg);
    }

    const data = await response.json();
    return {
      ids: data.ids,
      reason: data.reason
    };
  } catch (error) {
    console.warn("Backend proxy is unreachable, falling back to frontend mock engine:", error);
    // Simulate network delay for mock fallback
    await new Promise(resolve => setTimeout(resolve, 600));
    return getMockRecommendations(preference, products);
  }
}
