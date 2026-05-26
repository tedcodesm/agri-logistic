import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CloudRain, 
  Award, 
  Coins, 
  VolumeX, 
  Volume2, 
  MessageSquare, 
  Sparkles,
  CheckCircle,
  Clock
} from "lucide-react";
import { Farmer, ProduceListing, ProduceGrade, VerificationStatus } from "../types";

interface FarmersPanelProps {
  farmers: Farmer[];
  listings: ProduceListing[];
  onAddListing: (listing: ProduceListing) => void;
  onSyncListings: (localListings: ProduceListing[]) => void;
}

export default function FarmersPanel({ farmers, listings, onAddListing, onSyncListings }: FarmersPanelProps) {
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>("F-101");
  const [cropName, setCropName] = useState<string>("Maize");
  const [quantityKg, setQuantityKg] = useState<number>(1000);
  const [pricePerKg, setPricePerKg] = useState<number>(35);
  const [grade, setGrade] = useState<ProduceGrade>(ProduceGrade.GRADE_A);
  const [moisture, setMoisture] = useState<number>(13.0);
  const [desc, setDesc] = useState<string>("");
  const [spoilagePct, setSpoilagePct] = useState<number>(5);

  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [localQueue, setLocalQueue] = useState<ProduceListing[]>([]);
  const [syncing, setSyncing] = useState<boolean>(false);

  // AI Assistant States
  const [aiLang, setAiLang] = useState<"english" | "kiswahili">("english");
  const [chatMessage, setChatMessage] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<{ sender: "user" | "ai"; text: string }[]>([
    { sender: "ai", text: "Jambo! I am Mkulima Intel. How can I assist you with market pricing, moisture requirements, or potato storage targets in Nyandarua today?" }
  ]);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [predictiveData, setPredictiveData] = useState<any>(null);
  const [voiceSimulated, setVoiceSimulated] = useState<boolean>(false);

  const currentFarmer = farmers.find(f => f.id === selectedFarmerId) || farmers[0];

  // Fetch AI predictive pricing when crop changes
  useEffect(() => {
    fetchPricePrediction();
  }, [cropName, grade]);

  async function fetchPricePrediction() {
    try {
      const res = await fetch("/api/predict-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cropName, grade, county: currentFarmer.location.county })
      });
      const data = await res.json();
      setPredictiveData(data);
      if (data && data.predictedPricePerKg) {
        setPricePerKg(data.predictedPricePerKg);
        setSpoilagePct(cropName === "Tomatoes" ? 30 : cropName === "Avocados" ? 18 : 6);
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Handle local produce listing submit
  function handleSubmitListing(e: React.FormEvent) {
    e.preventDefault();
    const newListing: ProduceListing = {
      id: "L-" + Math.round(Math.random() * 9000 + 1000),
      farmerId: selectedFarmerId,
      cropName,
      quantityKg,
      pricePerKgKes: pricePerKg,
      harvestDate: new Date().toISOString().split("T")[0],
      grade,
      moistureContentPct: moisture,
      description: desc || `${grade} grade ${cropName} harvested at ${currentFarmer.location.county}. Ready for offloading.`,
      spoilageRiskPct: spoilagePct,
      isOfflineCreated: !isOnline,
      syncStatus: isOnline ? "SYNCED" : "PENDING",
      timestamp: new Date().toISOString()
    };

    if (isOnline) {
      onAddListing(newListing);
    } else {
      setLocalQueue([...localQueue, newListing]);
    }

    setDesc("");
  }

  // Handle Sync
  async function triggerSync() {
    if (localQueue.length === 0) return;
    setSyncing(true);
    // Simulate mobile networking latency over 3G in rural valleys
    await new Promise(resolve => setTimeout(resolve, 2000));
    onSyncListings(localQueue);
    setLocalQueue([]);
    setSyncing(false);
    setIsOnline(true);
  }

  // Handle AI Farmer Chat
  async function handleSendChat() {
    if (!chatMessage.trim()) return;
    const userMsg = chatMessage;
    setChatHistory(prev => [...prev, { sender: "user", text: userMsg }]);
    setChatMessage("");
    setAiLoading(true);

    try {
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, language: aiLang })
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, { sender: "ai", text: data.text }]);
    } catch (e) {
      setChatHistory(prev => [...prev, { sender: "ai", text: "Error loading AI response. Please check Port 3000 connectivity." }]);
    } finally {
      setAiLoading(false);
    }
  }

  // Simulate Voice Listing
  function simulateVoiceListingEnglish() {
    setVoiceSimulated(true);
    setCropName("Potatoes");
    setGrade(ProduceGrade.GRADE_A);
    setQuantityKg(3500);
    setMoisture(15);
    setDesc("Transcribed via Voice matching: Hand-sorted potatoes from Kinangop. High density, healthy skin.");
    setTimeout(() => setVoiceSimulated(false), 3000);
  }

  function simulateVoiceListingKiswahili() {
    setVoiceSimulated(true);
    setCropName("Maize");
    setGrade(ProduceGrade.GRADE_B);
    setQuantityKg(5000);
    setMoisture(13.2);
    setDesc("Transcribed via Kiswahili speech matching: Gunia hamsini za mahindi safi kavu kutoka Moiben.");
    setTimeout(() => setVoiceSimulated(false), 3000);
  }

  return (
    <div id="farmers-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
      {/* LEFT COLUMN: Profile and Add Form */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        
        {/* Profile Details Card */}
        <div id="farmer-profile-card" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start flex-wrap gap-3">
            <div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Farmer Workspace
              </span>
              <h3 className="text-lg font-bold text-slate-800 mt-2 flex items-center gap-2">
                {currentFarmer.name}
                <span className="text-xs font-normal text-slate-400">({currentFarmer.id})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                📍 {currentFarmer.location.subCounty}, {currentFarmer.location.county} County • {currentFarmer.farmSizeAcres} Acres
              </p>
            </div>

            {/* Network Offline Toggle Switch (Kenya Rural Simulation) */}
            <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-xs font-medium text-slate-600">Connectivity Mode:</span>
              <button
                id="online-toggle-btn"
                onClick={() => {
                  if (!isOnline) {
                    setIsOnline(true);
                    triggerSync();
                  } else {
                    setIsOnline(false);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isOnline 
                  ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/10" 
                  : "bg-red-500 text-white"
                }`}
              >
                {isOnline ? (
                  <>
                    <Wifi className="w-3.5 h-3.5" />
                    Online System
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5" />
                    Offline (SQLite Link)
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Select Farmer */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-500">Switch Farmer Account:</span>
            {farmers.map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedFarmerId(f.id)}
                className={`px-3 py-1.5 rounded-lg border font-medium cursor-pointer ${
                  selectedFarmerId === f.id 
                    ? "bg-slate-800 text-white border-slate-800" 
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>

        {/* Create Produce Listing Form */}
        <div id="new-produce-card" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-bold text-slate-800 tracking-tight uppercase flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-500" />
              Register New Harvest Produce
            </h4>
            
            {/* Voice Input simulation */}
            <div className="flex gap-2">
              <button
                id="voice-en-btn"
                type="button"
                onClick={simulateVoiceListingEnglish}
                className="flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 px-2 py-1 rounded hover:bg-emerald-100 border border-emerald-100 transition-all"
                title="Simulate speech to text listing in English"
              >
                <Volume2 className="w-3 h-3 animate-pulse" />
                Speech (EN)
              </button>
              <button
                id="voice-sw-btn"
                type="button"
                onClick={simulateVoiceListingKiswahili}
                className="flex items-center gap-1 text-[11px] font-medium bg-amber-50 text-amber-700 px-2 py-1 rounded hover:bg-amber-100 border border-amber-100 transition-all"
                title="Wapokeaji wa Sauti ya Kiswahili"
              >
                <Volume2 className="w-3 h-3 animate-pulse" />
                Sauti (SWH)
              </button>
            </div>
          </div>

          {voiceSimulated && (
            <div className="mb-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-800 animate-pulse flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Sauti Inachakatwa: <strong>Gemini Voice-to-Listing</strong> parsed crop details...</span>
            </div>
          )}

          <form onSubmit={handleSubmitListing} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Crop Variety</label>
                <select
                  id="crop-input"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-emerald-500"
                >
                  <option value="Maize">Highland White Corn (Maize)</option>
                  <option value="Potatoes">Shangi Potatoes</option>
                  <option value="Avocados">Export Hass Avocados</option>
                  <option value="Tomatoes">Beefsteak Tomatoes</option>
                  <option value="Beans">Nyayo Beans</option>
                  <option value="Cabbage">Gloria F1 Cabbage</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Produce Quality Grade</label>
                <select
                  id="grade-input"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as ProduceGrade)}
                  className="mt-1 block w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-emerald-500"
                >
                  <option value={ProduceGrade.GRADE_A}>Grade A (Premium Domestic / Export)</option>
                  <option value={ProduceGrade.GRADE_B}>Grade B (Standard Secondary Market)</option>
                  <option value={ProduceGrade.GRADE_C}>Grade C (Low Moisture / Distressed)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Quantity (Kg)</label>
                <input
                  id="qty-input"
                  type="number"
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(parseInt(e.target.value) || 0)}
                  className="mt-1 block w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Moisture Content (%)</label>
                <input
                  id="moisture-input"
                  type="number"
                  step="0.1"
                  value={moisture}
                  onChange={(e) => setMoisture(parseFloat(e.target.value) || 0)}
                  className="mt-1 block w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* AI Advisor Context Notification */}
            {predictiveData && (
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <div>
                    <span className="text-slate-400">Predicted Market Rate:</span>
                    <strong className="text-slate-800 ml-1">KES {predictiveData.predictedPricePerKg} / Kg</strong>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-sky-500" />
                  <div>
                    <span className="text-slate-400">Max Drying Threshold:</span>
                    <strong className="text-slate-800 ml-1">{predictiveData.maxMoistureAllowedPct}% Moisture</strong>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-2 py-1 rounded font-medium">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Grade {grade} Price Premium</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase">Listing Notes & Harvesting State</label>
              <textarea
                id="desc-input"
                rows={2}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Describe crop characteristics, e.g. Shangi potato variety grown in clay soils."
                className="mt-1 block w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <button
              id="submit-listing-btn"
              type="submit"
              className={`w-full py-3 rounded-xl font-semibold text-white tracking-wide transition-all select-none ${
                isOnline 
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-sm" 
                  : "bg-slate-700 hover:bg-slate-800 shadow-inner"
              }`}
            >
              {isOnline 
                ? "Broadcast to Cloud Market Portal" 
                : "Queue in Local Storage Sandbox (Offline Mode)"
              }
            </button>
          </form>

          {/* Local SQLite offline pending queue visual */}
          {localQueue.length > 0 && (
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex justify-between items-center mb-3">
                <h5 className="text-xs font-bold text-red-600 uppercase flex items-center gap-1.5">
                  <WifiOff className="w-3.5 h-3.5" />
                  SQLite Pending Queue ({localQueue.length})
                </h5>
                <button
                  id="sync-now-btn"
                  onClick={triggerSync}
                  disabled={syncing}
                  className="flex items-center gap-1.5 text-xs text-white bg-slate-800 hover:bg-slate-900 px-3 py-1.5 rounded-lg font-medium shadow-sm cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${syncing ? "animate-spin" : ""}`} />
                  {syncing ? "Syncing..." : "Sync to cloud DB now"}
                </button>
              </div>

              <div className="space-y-2">
                {localQueue.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 rounded-xl bg-red-50/50 border border-red-100 text-xs">
                    <div>
                      <strong className="text-slate-800">{item.cropName}</strong>
                      <span className="text-slate-400 mx-1.5">•</span>
                      <span>{item.quantityKg} Kg</span>
                      <span className="text-slate-400 mx-1.5">•</span>
                      <span>Grade {item.grade}</span>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded uppercase">
                      <Clock className="w-3 h-3" />
                      Pending Link
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Chat and Weather */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        
        {/* Gemini AI Farm Companion */}
        <div id="ai-farmer-chat-card" className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-lg flex flex-col h-[535px]">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              <div>
                <h4 className="text-sm font-bold tracking-tight">Mkulima Intel Chatbot</h4>
                <p className="text-[10px] text-slate-400">Server-Side Gemini 3.5-Flash Ecosystem</p>
              </div>
            </div>

            {/* Language Switcher */}
            <div className="flex rounded-lg border border-slate-800 overflow-hidden text-[10px] font-semibold">
              <button
                id="lang-en-btn"
                onClick={() => setAiLang("english")}
                className={`px-2 py-1 transition-all ${
                  aiLang === "english" ? "bg-emerald-500 text-white" : "text-slate-400 hover:bg-slate-800"
                }`}
              >
                EN
              </button>
              <button
                id="lang-sw-btn"
                onClick={() => setAiLang("kiswahili")}
                className={`px-2 py-1 transition-all ${
                  aiLang === "kiswahili" ? "bg-amber-500 text-white" : "text-slate-400 hover:bg-slate-800"
                }`}
              >
                SWH
              </button>
            </div>
          </div>

          {/* Chat History Container */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1 text-xs max-h-[350px]">
            {chatHistory.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                  item.sender === "user"
                    ? "bg-emerald-600 text-white ml-auto"
                    : "bg-slate-800 text-slate-200 mr-auto"
                }`}
              >
                {item.text}
              </div>
            ))}
            {aiLoading && (
              <div className="bg-slate-800 text-slate-400 p-3 rounded-xl max-w-[50%] animate-pulse">
                Inachakata jibu... (Thinking)
              </div>
            )}
          </div>

          {/* Pre-suggested quick farmer triggers */}
          <div className="mb-3 flex flex-wrap gap-1.5 text-[10px]">
            <button
              id="prompt-pvt-btn"
              onClick={() => setChatMessage(aiLang === "english" ? "What is the potato price in Nakuru?" : "Ni nini bei ya viazi Nakuru?")}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded"
            >
              📊 {aiLang === "english" ? "Potato Index" : "Bei ya Viazi"}
            </button>
            <button
              id="prompt-mst-btn"
              onClick={() => setChatMessage(aiLang === "english" ? "What moisture limits apply to Moiben maize to prevent aflatoxin?" : "Moisture ya mahindi inafaa kuwa ngapi ilizuia sumu?")}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded"
            >
              🌾 {aiLang === "english" ? "Maize Moisture" : "Unyevu wa Mahindi"}
            </button>
            <button
              id="prompt-sph-btn"
              onClick={() => setChatMessage(aiLang === "english" ? "How do cold temperatures reduce spoilage in avocados?" : "Jinsi ya kulinda parachichi lisiharibike?")}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded"
            >
              🥑 {aiLang === "english" ? "Spoilage Prevention" : "Uharibifu Parachichi"}
            </button>
          </div>

          {/* Chat Form */}
          <div className="flex gap-2">
            <input
              id="chat-text-input"
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendChat();
              }}
              placeholder={aiLang === "english" ? "Ask about post-harvest loss, prices, local logistics..." : "Uliza kuhusu moisture, maghala ya Nyandarua..."}
              className="flex-1 rounded-xl bg-slate-800 border border-slate-750 px-3 py-2 text-xs outline-none focus:border-emerald-500"
            />
            <button
              id="chat-send-btn"
              onClick={handleSendChat}
              disabled={aiLoading}
              className="bg-emerald-500 text-white rounded-xl px-4 text-xs font-semibold py-2 hover:bg-emerald-600 transition-all select-none cursor-pointer"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
