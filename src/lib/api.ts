export type PredictionPayload = {
  model?: string;
  features: Record<string, unknown>;
};

export type PredictionResult = {
  model: string;
  prediction: unknown;
  details?: Record<string, unknown>;
};

// 4. FIX FRONTEND FETCH REQUEST - Use full URL as directed
const API_URL = "https://pravah-template.onrender.com";

/**
 * 5. ADD RENDER COLD START HANDLING
 * Helper to retry the fetch request (3 times with 2s delay)
 * This helps when the Render free tier service is waking up.
 */
async function fetchWithRetry(url: string, options: RequestInit, retries = 3, delay = 2000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      // If we get a server error (likely cold start timeout), we retry
      if (response.status >= 500) throw new Error(`Server error: ${response.status}`);
      return response; 
    } catch (err) {
      if (i === retries - 1) throw err;
      console.log(`⚠️ Render Service waking up... Retrying... (Attempt ${i + 1}/${retries})`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error("Failed to connect to backend after several attempts. Please try again in 1 minute.");
}

export async function predict(
  payload: PredictionPayload
): Promise<PredictionResult> {
  console.log("🚀 Starting Prediction Request:", payload);
  
  const response = await fetchWithRetry(`${API_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: payload.model ?? "dummy",
      features: payload.features ?? {},
    }),
    cache: "no-store", // 4. FIX FRONTEND FETCH REQUEST - No cache
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("❌ API Error:", text);
    throw new Error(`Prediction failed: ${text || response.statusText}`);
  }

  const result = await response.json();
  console.log("✅ API Success Response:", result);
  return result;
}

// Real Estate specific types and functions
export type RealEstateRequest = {
  location: "Vashi" | "Nerul" | "Kharghar" | "Panvel";
  area: number;
  bhk: number;
  bathrooms: number;
  age: number;
  parking: boolean;
};

export type RealEstateResponse = {
  predicted_price: number;
  price_per_sqft: number;
  market_status: string;
};

export async function predictRealEstate(
  payload: RealEstateRequest
): Promise<RealEstateResponse> {
  console.log("🚀 Calling Real Estate API:", `${API_URL}/predict/real-estate`);
  
  try {
    const response = await fetchWithRetry(`${API_URL}/predict/real-estate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store", // 4. FIX FRONTEND FETCH REQUEST
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ API Error:", text);
      throw new Error(`Real estate prediction failed: ${text || response.statusText}`);
    }

    const result = await response.json();
    console.log("✅ API Success:", result);
    return result;
  } catch (error) {
    console.error("❌ Fetch failed:", error);
    throw error;
  }
}
