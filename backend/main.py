import os
import json
import logging
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import httpx
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("recommendation-backend")

# Try to load .env from the backend directory first, then from the root directory
if os.path.exists(".env"):
    load_dotenv(".env")
    logger.info("Loaded .env from backend directory")
elif os.path.exists("../.env"):
    load_dotenv("../.env")
    logger.info("Loaded .env from root directory")
else:
    load_dotenv()
    logger.info("Loaded environment variables from standard path")

# Retrieve configuration and clean any wrapping quotes
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if GROQ_API_KEY:
    GROQ_API_KEY = GROQ_API_KEY.strip().strip("'\"")

GROQ_MODEL = os.getenv("GROQ_MODEL", "qwen3.6-27b")
if GROQ_MODEL:
    GROQ_MODEL = GROQ_MODEL.strip().strip("'\"")

app = FastAPI(
    title="Product Recommendation Proxy API",
    description="FastAPI backend to proxy requests securely to the Groq API.",
    version="1.0.0"
)

# CORS configurations
origins = [
    "http://localhost:5173", # Vite default dev server
    "http://localhost:5174", # Vite alternate dev server
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Product catalog - single source of truth
PRODUCTS: List[Dict[str, Any]] = [
    {
        "id": "p1",
        "name": "QuantumPhone 15 Pro",
        "category": "Phone",
        "price": 999,
        "blurb": "Sleek titanium design, pro-grade triple camera system, and ultra-fast A-series chip."
    },
    {
        "id": "p2",
        "name": "Nexus Core A54",
        "category": "Phone",
        "price": 450,
        "blurb": "Vibrant AMOLED screen, solid daily performance, and multi-day battery life at a friendly price."
    },
    {
        "id": "p3",
        "name": "Apex Lite Mobile",
        "category": "Phone",
        "price": 199,
        "blurb": "Super-affordable starter phone featuring a clean interface and massive battery life."
    },
    {
        "id": "p4",
        "name": "AeroBook Pro 14",
        "category": "Laptop",
        "price": 949,
        "blurb": "Thin and light aluminum powerhouse with a stunning retina display and all-day battery."
    },
    {
        "id": "p5",
        "name": "SwiftGlide 15",
        "category": "Laptop",
        "price": 599,
        "blurb": "Reliable mid-range laptop equipped with AMD Ryzen, full keyboard, and metal chassis."
    },
    {
        "id": "p6",
        "name": "Acoustic Silence Elite",
        "category": "Headphones",
        "price": 349,
        "blurb": "Audiophile-grade wireless sound with industry-leading active noise cancellation (ANC)."
    },
    {
        "id": "p7",
        "name": "EchoBuds Air",
        "category": "Headphones",
        "price": 39,
        "blurb": "Pocket-sized true wireless earbuds with punchy bass and a convenient charging case."
    },
    {
        "id": "p8",
        "name": "OmniPad Air 10",
        "category": "Tablet",
        "price": 449,
        "blurb": "Vibrant stylus-ready screen, ideal for sketching, digital note-taking, and streaming media."
    },
    {
        "id": "p9",
        "name": "Horizon Go Tab",
        "category": "Tablet",
        "price": 129,
        "blurb": "Affordable family tablet optimized for reading books, streaming kids shows, and browsing."
    },
    {
        "id": "p10",
        "name": "PaperInk Paperwhite",
        "category": "E-reader",
        "price": 139,
        "blurb": "Waterproof, glare-free 300 ppi display with warm light adjustment for late-night reading."
    },
    {
        "id": "p11",
        "name": "NovaFit Active 3",
        "category": "Smartwatch",
        "price": 299,
        "blurb": "Smartwatch with advanced health tracking, built-in GPS, and a sleek round AMOLED display."
    },
    {
        "id": "p12",
        "name": "VibeWave Boom 2",
        "category": "Speaker",
        "price": 149,
        "blurb": "Waterproof outdoor Bluetooth speaker with rich 360-degree sound and 24-hour battery life."
    },
    {
        "id": "p13",
        "name": "Titan Console X",
        "category": "Gaming",
        "price": 499,
        "blurb": "Next-generation gaming console featuring ultra-fast SSD load times and immersive 4K HDR graphics."
    },
    {
        "id": "p14",
        "name": "KeyGlide Keyboard",
        "category": "Accessories",
        "price": 89,
        "blurb": "Tactile mechanical keyboard with customizable RGB backlighting and quiet switches for typing comfort."
    }
]

PRODUCTS_BY_ID = {p["id"]: p for p in PRODUCTS}

# Pydantic Schemas
class RecommendRequest(BaseModel):
    query: str = Field(..., description="Natural language preference description")

class RecommendResponse(BaseModel):
    ids: List[str] = Field(..., description="List of matched product IDs")
    reason: str = Field(..., description="Explanation of matches generated by AI")
    products: List[Dict[str, Any]] = Field(..., description="Complete product dictionary details")

@app.get("/api/products")
async def get_products():
    """Returns the complete product catalog."""
    return PRODUCTS

def get_mock_recommendations(preference: str) -> Dict[str, Any]:
    query = preference.lower()
    matched_products = []
    
    # 1. Detect category keyword
    category = None
    if "phone" in query or "mobile" in query:
        category = "Phone"
    elif "laptop" in query or "computer" in query or "notebook" in query:
        category = "Laptop"
    elif "headphone" in query or "earbud" in query or "sound" in query or "audio" in query:
        category = "Headphones"
    elif "tablet" in query or "ipad" in query or "tab" in query:
        category = "Tablet"
    elif "reader" in query or "kindle" in query or "book" in query:
        category = "E-reader"

    # 2. Detect price limit
    price_limit = None
    import re
    price_match = re.search(r'(?:under|below|less\s+than|budget\s+of)\s*(?:\$)?\s*(\d+)', query)
    if price_match:
        price_limit = int(price_match.group(1))

    # Filter products
    for p in PRODUCTS:
        matches_category = not category or p["category"] == category
        matches_price = not price_limit or p["price"] <= price_limit
        
        # Extra keywords
        if "cheap" in query or "budget" in query:
            matches_price = matches_price and p["price"] < 200
        elif "premium" in query or "pro" in query or "high-end" in query or "expensive" in query:
            matches_price = matches_price and p["price"] > 500

        if matches_category and matches_price:
            matched_products.append(p)

    # Fallbacks
    if not matched_products:
        if price_limit:
            matched_products = [p for p in PRODUCTS if p["price"] <= price_limit]
        if not matched_products:
            matched_products = [PRODUCTS[1], PRODUCTS[9]] # Nexus A54 and PaperInk

    matched_ids = [p["id"] for p in matched_products]
    names = " and ".join([p["name"] for p in matched_products[:2]])

    if category and price_limit:
        reason = f"Found {category}s under ${price_limit}. Highlighted {names} as the best options matching your budget."
    elif category:
        reason = f"Filtered for the {category} category. We suggest {names} based on their features and customer rating."
    elif price_limit:
        reason = f"Identified options priced below ${price_limit}, highlighting {names} for their balance of features and cost."
    else:
        reason = f"Analyzed your request and selected {names} as top recommendations."

    return {
        "ids": matched_ids,
        "reason": f"[MOCK DEMO] {reason}",
        "products": matched_products
    }

@app.post("/api/recommend", response_model=RecommendResponse)
async def recommend_products(req: RecommendRequest):
    """
    Receives user query, constructs prompt, sends requests to Groq,
    cleans response defensively, cross-references product database,
    and returns recommendations with full object payloads.
    """
    query = req.query.strip()
    if not query:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Preference query cannot be empty or whitespace only."
        )

    # If no API key is provided, or is 'mock', use the python mock engine
    if not GROQ_API_KEY or GROQ_API_KEY.lower() == "mock":
        import asyncio
        await asyncio.sleep(0.8) # simulate network latency
        return get_mock_recommendations(query)

    system_prompt = (
        "You are a product recommendation system. You will receive a list of products in JSON format and a user's natural language preference.\n"
        "Your sole task is to select the products from the list that match the user's preference and explain why in a short sentence.\n\n"
        "Strict constraints:\n"
        "1. ONLY select product IDs that exist in the provided product list. Do not make up IDs.\n"
        "2. Return a strict JSON object with EXACTLY two fields:\n"
        "   - \"ids\": an array of matching product ID strings (e.g. [\"p1\", \"p3\"])\n"
        "   - \"reason\": a single sentence explaining why these products match the preference (max 20 words).\n"
        "3. Do NOT wrap your output in markdown fences (like ```json).\n"
        "4. Do NOT output any conversational text, pleasantries, or explanations outside the JSON object.\n"
        "5. If no products match, return {\"ids\": [], \"reason\": \"No products match your preference.\"}"
    )

    user_message = f"Product List:\n{json.dumps(PRODUCTS, indent=2)}\n\nUser Preference:\n\"{query}\""

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {GROQ_API_KEY.strip()}"
    }
    
    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        "temperature": 0,
        "response_format": {"type": "json_object"}
    }

    url = "https://api.groq.com/openai/v1/chat/completions"

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            response = await client.post(url, headers=headers, json=payload)
        except httpx.RequestError as exc:
            logger.error(f"Failed to reach Groq API: {exc}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Failed to communicate with outbound Groq API: {str(exc)}"
            )

        if response.status_code != 200:
            logger.error(f"Groq API returned HTTP {response.status_code}: {response.text}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Groq API returned error status: {response.status_code}"
            )

        # Parse Groq completion response
        try:
            data = response.json()
        except ValueError:
            logger.error("Failed to parse Groq response as JSON envelope")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Invalid response format received from Groq API (invalid outer JSON)."
            )

        content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
        if not content:
            logger.error("Groq choice message content is empty")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Empty recommendation content received from Groq API."
            )

        # Clean potential markdown fences (defensive parsing)
        content_cleaned = content.strip()
        if content_cleaned.startswith("```"):
            # Strip start fence
            if content_cleaned.startswith("```json"):
                content_cleaned = content_cleaned[7:]
            else:
                content_cleaned = content_cleaned[3:]
            # Strip end fence
            if content_cleaned.endswith("```"):
                content_cleaned = content_cleaned[:-3]
            content_cleaned = content_cleaned.strip()

        # Parse final recommended products details
        try:
            parsed_result = json.loads(content_cleaned)
        except json.JSONDecodeError as err:
            logger.error(f"Failed to parse cleaned LLM content as JSON: {content_cleaned}. Err: {err}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="The AI recommendation engine output was not format-compliant."
            )

        # Structure checks
        recommended_ids = parsed_result.get("ids", [])
        if not isinstance(recommended_ids, list):
            recommended_ids = []
        
        reason = parsed_result.get("reason", "Matches selected based on preference.")

        # Cross-reference and drop invalid/hallucinated IDs
        valid_ids = []
        matched_products = []
        for p_id in recommended_ids:
            if p_id in PRODUCTS_BY_ID:
                valid_ids.append(p_id)
                matched_products.append(PRODUCTS_BY_ID[p_id])
            else:
                logger.warning(f"Model recommended a non-existent product ID: {p_id}")

        return {
            "ids": valid_ids,
            "reason": reason,
            "products": matched_products
        }
