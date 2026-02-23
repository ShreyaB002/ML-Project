"use client";

import { useState, useMemo } from "react";

import { predictRealEstate } from "@/lib/api";

// --- Types ---
interface PredictionResult {
  predicted_price: number;
  price_per_sqft: number;
  market_status: string;
}

// --- Hardcoded Insights for better UX ---
const LOCATION_INSIGHTS = {
  Vashi: {
    tag: "Commercial Hub",
    desc: "Oldest planned suburb, known for corporate offices, malls, and premium connectivity to Mumbai. Real estate is consistently high here.",
    amenities: ["🚆 Vashi Station", "🛍️ Inorbit Mall", "🏦 Corporate Park"],
  },
  Nerul: {
    tag: "Residential & Education",
    desc: "A major educational hub with top colleges and upscale residential complexes. Offers a balanced lifestyle with parks and gardens.",
    amenities: ["🎓 DY Patil University", "🚂 Seawoods Grand Central", "⚽ Sports Hub"],
  },
  Kharghar: {
    tag: "Modern Township",
    desc: "One of the most modern and well-planned suburbs. Famous for its green surroundings, waterfalls (during monsoons), and broad roads.",
    amenities: ["⛳ Golf Course", "🌳 Central Park", "🚉 Kharghar Station"],
  },
  Panvel: {
    tag: "Rising Star",
    desc: "The fastest-growing node, favored by first-time buyers. High appreciation potential due to the upcoming Navi Mumbai International Airport.",
    amenities: ["✈️ Future Airport", "🛤️ Panvel Terminus", "🛣️ Mumbai-Pune Hwy"],
  },
};

export default function Home() {
  // --- Form State ---
  const [location, setLocation] = useState<keyof typeof LOCATION_INSIGHTS>("Vashi");
  const [area, setArea] = useState("");
  const [bhk, setBhk] = useState("2");
  const [bathrooms, setBathrooms] = useState("2");
  const [age, setAge] = useState("");
  const [parking, setParking] = useState(true);
  
  // --- UI/UX State ---
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState("");
  const [showInsights, setShowInsights] = useState(true);

  // --- Logic ---
  const handlePredict = async () => {
    // 1. Reset state
    setLoading(true);
    setError("");
    setResult(null);

    // 2. Validate
    const areaVal = parseFloat(area);
    const ageVal = parseInt(age);

    if (isNaN(areaVal) || areaVal < 300) {
      setError("Please enter a realistic area (minimum 300 sq ft)");
      setLoading(false);
      return;
    }

    if (isNaN(ageVal) || ageVal < 0 || ageVal > 60) {
      setError("Please enter a valid property age (0 to 60 years)");
      setLoading(false);
      return;
    }

    try {
      // Small artificial delay for "ML feel" UX
      await new Promise(r => setTimeout(r, 600));

      console.log("🚀 Starting prediction...");
      const response = await predictRealEstate({
        location,
        area: areaVal,
        bhk: parseInt(bhk),
        bathrooms: parseInt(bathrooms),
        age: ageVal,
        parking,
      });
      setResult(response);
    } catch (err) {
      console.error("❌ Prediction Error:", err);
      setError(
        err instanceof Error 
          ? `Error: ${err.message}. If the backend is restarting (Render Cold Start), this might take up to 60 seconds. Please try again in a minute.` 
          : "The prediction service is currently unavailable. Please check your backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // --- Memoized Market Comparison ---
  const marketColor = useMemo(() => {
    if (!result) return "";
    switch (result.market_status) {
      case "Below Market": return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case "Above Market": return "text-rose-600 bg-rose-50 border-rose-200";
      default: return "text-amber-600 bg-amber-50 border-amber-200";
    }
  }, [result]);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-blue-100">
      {/* Decorative Header Background */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 -z-10 opacity-10"></div>

      <main className="mx-auto max-w-5xl px-6 py-12 md:py-20">
        
        {/* HERO SECTION */}
        <div className="relative mb-12 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            Real-Time AI Estimates
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 via-zinc-800 to-neutral-700">
            Navi Mumbai PropVal <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">AI</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-500 max-w-2xl leading-relaxed">
            Instant residential property valuations across Navi Mumbai's most popular neighborhoods, powered by Linear Regression.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr,360px]">
          
          <div className="space-y-8">
            {/* FORM CARD */}
            <section className="bg-white rounded-3xl border border-neutral-200 shadow-[0_20px_50px_rgba(0,0,0,0.02)] p-6 md:p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                   <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                   </div>
                   Property Characteristics
                  </h2>
                  <button 
                    onClick={() => setShowInsights(!showInsights)}
                    className="text-xs font-medium text-neutral-400 hover:text-indigo-600 transition-colors"
                  >
                    {showInsights ? "Hide Map Insights" : "Show Map Insights"}
                  </button>
                </div>

                <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                  <FormField label="Location">
                    <select
                      className="w-full h-12 bg-neutral-50 rounded-xl border border-neutral-200 px-4 text-sm font-medium focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                      value={location}
                      onChange={(e) => setLocation(e.target.value as any)}
                    >
                      <option value="Vashi">Vashi (Premium)</option>
                      <option value="Nerul">Nerul (Elite)</option>
                      <option value="Kharghar">Kharghar (Modern)</option>
                      <option value="Panvel">Panvel (Growth)</option>
                    </select>
                    <div className="absolute right-4 top-10 pointer-events-none text-neutral-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </FormField>

                  <FormField label="Area / Built-up Size">
                    <div className="relative">
                      <input
                        type="number"
                        className="w-full h-12 bg-neutral-50 rounded-xl border border-neutral-200 px-4 pr-14 text-sm font-medium focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        placeholder="e.g. 1000"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">sq.ft</span>
                    </div>
                  </FormField>

                  <FormField label="Bedrooms (BHK)">
                    <div className="flex gap-2 p-1 bg-neutral-50 rounded-xl border border-neutral-200">
                      {["1", "2", "3", "4"].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setBhk(v)}
                          className={`flex-1 h-10 rounded-lg text-sm font-semibold transition-all ${
                            bhk === v ? "bg-white text-indigo-700 shadow-sm ring-1 ring-neutral-200" : "text-neutral-500 hover:text-neutral-700"
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </FormField>

                  <FormField label="Bathrooms">
                    <div className="flex gap-2 p-1 bg-neutral-50 rounded-xl border border-neutral-200">
                      {["1", "2", "3"].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setBathrooms(v)}
                          className={`flex-1 h-10 rounded-lg text-sm font-semibold transition-all ${
                            bathrooms === v ? "bg-white text-indigo-700 shadow-sm ring-1 ring-neutral-200" : "text-neutral-500 hover:text-neutral-700"
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </FormField>

                  <FormField label="Structure Age">
                    <div className="relative">
                      <input
                        type="number"
                        className="w-full h-12 bg-neutral-50 rounded-xl border border-neutral-200 px-4 pr-16 text-sm font-medium focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="e.g. 5"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">years</span>
                    </div>
                  </FormField>

                  <div className="flex flex-col justify-end pb-1">
                    <label className="group flex items-center gap-3 cursor-pointer select-none">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={parking}
                          onChange={(e) => setParking(e.target.checked)}
                        />
                        <div className={`w-12 h-6 rounded-full transition-colors duration-200 ${parking ? "bg-indigo-600" : "bg-neutral-200"}`}></div>
                        <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-sm ${parking ? "translate-x-6" : "translate-x-0"}`}></div>
                      </div>
                      <span className="text-sm font-semibold text-neutral-700 group-hover:text-neutral-900 transition-colors">Dedicated Parking</span>
                    </label>
                  </div>
                </div>

                <div className="mt-10">
                  <button
                    onClick={handlePredict}
                    disabled={loading}
                    className="group relative w-full h-14 bg-neutral-900 rounded-2xl text-white font-bold transition-all hover:bg-black active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 shadow-xl shadow-neutral-200 ring-4 ring-neutral-900/5 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="relative flex items-center justify-center gap-2">
                       {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                           Running Inference Engine...
                        </>
                       ) : (
                        <>
                          Calculate Estimate
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
                        </>
                       )}
                    </span>
                  </button>
                </div>
              </div>
            </section>

            {/* RESULTS VIEW */}
            {(error || result) && (
              <section className={`rounded-3xl border p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ${error ? "bg-rose-50 border-rose-200" : "bg-white border-neutral-200 scroll-mt-20 shadow-xl shadow-neutral-100"}`}>
                {error ? (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 font-bold">!</div>
                    <div>
                      <h3 className="text-rose-900 font-bold mb-1">Calculation Error</h3>
                      <p className="text-rose-700/80 text-sm leading-relaxed">{error}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                      <div>
                        <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-1">Estimated Market Value</h3>
                        <p className="text-4xl md:text-5xl font-black text-neutral-900 tabular-nums">{formatCurrency(result!.predicted_price)}</p>
                      </div>
                      <div className={`px-4 py-2 rounded-xl border self-start md:self-center font-bold text-sm flex items-center gap-2 ${marketColor}`}>
                        <div className={`w-2 h-2 rounded-full animate-pulse ${result!.market_status === "Average" ? "bg-amber-500" : result!.market_status === "Below Market" ? "bg-emerald-500" : "bg-rose-500"}`}></div>
                        {result!.market_status}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                       <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-100">
                          <p className="text-xs font-bold text-neutral-400 mb-2 uppercase tracking-tight text-center sm:text-left">Price Efficiency</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-bold">{formatCurrency(result!.price_per_sqft)}</span>
                            <span className="text-[10px] font-black text-neutral-300">/sq.ft</span>
                          </div>
                          {/* Simple bar visual */}
                          <div className="mt-3 w-full bg-neutral-200 h-1 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 ${result!.market_status === "Below Market" ? "bg-emerald-500 w-1/3" : result!.market_status === "Above Market" ? "bg-rose-500 w-full" : "bg-amber-500 w-2/3"}`}
                            ></div>
                          </div>
                       </div>

                       <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-100 flex flex-col justify-center">
                          <p className="text-xs italic text-neutral-500 leading-snug">
                            {result!.market_status === "Below Market" && "✨ Analysis suggests this property has attractive pricing based on historical data for this area."}
                            {result!.market_status === "Average" && "⚖️ This property is priced optimally. Evaluation matches the current standard market trend."}
                            {result!.market_status === "Above Market" && "🔥 Premium pricing detected. This might be due to luxury finishes or recent locality enhancements."}
                          </p>
                       </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <p className="text-[10px] text-neutral-400 font-medium">Model ID: LREG-NMB-01 • Based on ~300 verified data points</p>
                      <button 
                        onClick={() => window.print()}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                        Export PDF
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>

          {/* SIDEBAR - MAP INSIGHTS */}
          <aside className={`space-y-6 transition-all duration-500 ${showInsights ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12 pointer-events-none hidden lg:block"}`}>
             <div className="bg-white rounded-3xl border border-neutral-200 p-6 sticky top-8">
                <h3 className="font-black text-sm uppercase tracking-widest text-neutral-400 mb-6 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                  Location Snapshot
                </h3>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-neutral-900">{location}</span>
                      <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-[10px] font-black uppercase text-zinc-500">
                        {LOCATION_INSIGHTS[location].tag}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 leading-relaxed mb-4">
                      {LOCATION_INSIGHTS[location].desc}
                    </p>
                    
                    <div className="space-y-2">
                      {LOCATION_INSIGHTS[location].amenities.map(item => (
                        <div key={item} className="flex items-center gap-2 text-[11px] font-semibold text-neutral-700 bg-neutral-50 p-2 rounded-lg border border-neutral-100">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-neutral-100">
                    <h4 className="text-[10px] font-bold text-neutral-400 uppercase mb-3">Valuation Tips</h4>
                    <ul className="space-y-3">
                      <Tip icon="🕒">Older buildings (&gt;10 years) depreciated significantly in this model.</Tip>
                      <Tip icon="🚗">Dedicated parking adds a premium of ~₹300-500 per sq ft.</Tip>
                      <Tip icon="🏙️">Higher floor or view-facing flats usually fetch 10-15% more (not in basic model).</Tip>
                    </ul>
                  </div>
                </div>
             </div>
          </aside>
        </div>

        <footer className="mt-20 py-8 border-t border-neutral-200 text-center">
          <p className="text-sm font-medium text-neutral-400">
            Powered by Scikit-Learn • FastAPI • Next.js
          </p>
          <div className="flex items-center justify-center gap-6 mt-4 opacity-40">
             <div className="w-8 h-8 rounded-full bg-neutral-200"></div>
             <div className="w-12 h-1 h-3 rounded-full bg-neutral-200"></div>
             <div className="w-8 h-8 rounded-full bg-neutral-200"></div>
          </div>
        </footer>
      </main>
    </div>
  );
}

// --- Internal Components ---

function FormField({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block relative space-y-2 ${className}`}>
      <span className="text-xs font-bold text-neutral-500 uppercase tracking-tighter ml-1">
        {label}
      </span>
      {children}
    </label>
  );
}

function Tip({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3 text-xs leading-relaxed text-neutral-600">
      <span className="shrink-0">{icon}</span>
      <span>{children}</span>
    </li>
  );
}

