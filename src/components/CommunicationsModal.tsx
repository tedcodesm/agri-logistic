import React, { useState, useEffect } from "react";
import { 
  X, Mail, MessageSquare, Phone, Volume2, ShieldAlert, CheckCircle2, 
  Terminal, Sparkles, User, Database, Coins, Compass, PhoneCall, RefreshCw
} from "lucide-react";
import { Farmer, Buyer, Driver } from "../types";

interface CommunicationsModalProps {
  onClose: () => void;
  farmers: Farmer[];
  buyers: Buyer[];
  drivers: Driver[];
}

export default function CommunicationsModal({ onClose, farmers, buyers, drivers }: CommunicationsModalProps) {
  const [activeSegment, setActiveSegment] = useState<"SMS" | "VOICE" | "SYSTEM_LOGS">("SMS");

  // Recipient presets selection state
  const [recipientType, setRecipientType] = useState<"farmer" | "buyer" | "driver" | "custom">("farmer");
  const [selectedPresetId, setSelectedPresetId] = useState<string>("");
  const [manualPhone, setManualPhone] = useState<string>("+254 ");
  const [targetNumber, setTargetNumber] = useState<string>("");

  // SMS Input
  const [smsMessage, setSMSMessage] = useState<string>("");
  const [isSendingSMS, setIsSendingSMS] = useState<boolean>(false);
  const [smsResult, setSMSResult] = useState<any>(null);

  // Voice Speech Input
  const [voiceSpeech, setVoiceSpeech] = useState<string>("");
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [callState, setCallState] = useState<"IDLE" | "DIALING" | "RINGING" | "ANSWERED" | "TTS_STREAMING" | "COMPLETED">("IDLE");
  const [voiceResult, setVoiceResult] = useState<any>(null);

  // Gemini generator helper states
  const [isDraftingGemini, setIsDraftingGemini] = useState<boolean>(false);
  const [geminiStatus, setGeminiStatus] = useState<string>("");

  // History logs maintained locally in the view
  const [commsHistory, setCommsHistory] = useState<Array<{
    id: string;
    type: "SMS" | "VOICE";
    recipient: string;
    targetName: string;
    payloadText: string;
    costKes: number;
    timestamp: string;
    status: "Success" | "Simulated" | "Failed";
  }>>([
    {
      id: "C-901",
      type: "SMS",
      recipient: "+254712345678",
      targetName: "Josphat Kiprono",
      payloadText: "Hujambo Josphat! Your Maize listing (Grade A, 3500Kg) spoilage risk predicted by AI is below 5%. Grain moisture holds at stable 13.1%. Keep in dry storage.",
      costKes: 0.8,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: "Simulated"
    },
    {
      id: "C-902",
      type: "VOICE",
      recipient: "+254711223344",
      targetName: "Peter Mwangi",
      payloadText: "Attention Driver Peter! Emergency congestion incident on route Nairobi Highway. Rerouting map payload waypoints. Maintain speed limits.",
      costKes: 4.5,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      status: "Simulated"
    }
  ]);

  // Handle changing presets to update the actual numeric recipient target auto
  useEffect(() => {
    if (recipientType === "custom") {
      setTargetNumber(manualPhone);
    } else {
      let phone = "";
      let id = selectedPresetId;
      if (recipientType === "farmer") {
        const item = farmers.find(f => f.id === id) || farmers[0];
        if (item) {
          phone = item.phoneNumber;
          if (!selectedPresetId) setSelectedPresetId(item.id);
        }
      } else if (recipientType === "buyer") {
        const item = buyers.find(b => b.id === id) || buyers[0];
        if (item) {
          phone = item.phoneNumber;
          if (!selectedPresetId) setSelectedPresetId(item.id);
        }
      } else if (recipientType === "driver") {
        const item = drivers.find(d => d.id === id) || drivers[0];
        if (item) {
          phone = item.phoneNumber;
          if (!selectedPresetId) setSelectedPresetId(item.id);
        }
      }
      setTargetNumber(phone);
    }
  }, [recipientType, selectedPresetId, manualPhone, farmers, buyers, drivers]);

  // Get recipient display name for records
  function getRecipientName(): string {
    if (recipientType === "custom") return "Custom Number";
    if (recipientType === "farmer") {
      return farmers.find(f => f.id === selectedPresetId)?.name || "Farmer Preset";
    }
    if (recipientType === "buyer") {
      return buyers.find(b => b.id === selectedPresetId)?.name || "Buyer Preset";
    }
    if (recipientType === "driver") {
      return drivers.find(d => d.id === selectedPresetId)?.name || "Driver Preset";
    }
    return "Unknown";
  }

  // Trigger Gemini to generate localized SMS or Voice content based on recipient Context!
  async function generateAIAlertTemplate(type: "SMS" | "VOICE") {
    setIsDraftingGemini(true);
    setGeminiStatus("Invoking server-side Gemini 3.5-Flash grounding analytics...");
    const name = getRecipientName();
    const isSwh = Math.random() > 0.4; // Introduce beautiful English/Swahili variation matching standard practices in rural Kenya

    const languageFlag = isSwh ? "Kiswahili" : "English";

    const promptText = type === "SMS"
      ? `Draft a short professional SMS alert representing KE-AgriLogistics Link to address agricultural participant ${name} at mobile number ${targetNumber}. Context: Produce verification updates, moisture readings (<13.5%), or cold ware house delivery proof verification. Keep the text under 130 characters. Output language is: ${languageFlag}. Return ONLY the SMS message text.`
      : `Draft a professional Text-To-Speech robotic voice script to address transporter ${name} at phone ${targetNumber}. Context: Route waypoint weather change alert, or cargo loading proof requirement, or delivery confirmation instructions. Keep it concise, expressive, and friendly. Output language is: ${languageFlag}. Return ONLY the spoken text output.`;

    try {
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: promptText,
          language: isSwh ? "kiswahili" : "english"
        })
      });
      const data = await res.json();
      if (data.text) {
        // Strip out simulated AI notice markers from text if any
        let cleanText = data.text.replace(/\[Simulated AI - .*\]/i, "").trim();
        if (type === "SMS") {
          setSMSMessage(cleanText);
        } else {
          setVoiceSpeech(cleanText);
        }
        setGeminiStatus("");
      } else {
        throw new Error("Empty AI text");
      }
    } catch (e) {
      // High quality local preset fallback in case Gemini keys are blank
      if (type === "SMS") {
        const fall = isSwh 
          ? `Hujambo ${name}! Mzigo wako wa kilimo umekaguliwa salama. Kiwango cha unyevu ni 13.1%. Tumisafirisha soko kuu.` 
          : `AgriLogistics Notice: Dear ${name}, your produce listing Grade A is dispatched. Track live cold telemetry online using PIN code.`;
        setSMSMessage(fall);
      } else {
        const fall = isSwh
          ? `Jambo dereva ${name}! Hivi ni vyeti vya dharura vya kuingia katika bandari ya cold storage. Tafadhali thibitisha unyevu kwa msimbo.`
          : `Attention driver ${name}! Waypoint security route dispatch is activated for your vehicle. Please proceed with speed constraints.`;
        setVoiceSpeech(fall);
      }
      setGeminiStatus("");
    } finally {
      setIsDraftingGemini(false);
    }
  }

  // Action: Post SMS to server
  async function handleSendSMS(e: React.FormEvent) {
    e.preventDefault();
    if (!smsMessage.trim() || !targetNumber) return;

    setIsSendingSMS(true);
    setSMSResult(null);

    // Normalize phone number (strip spaces for Africa's Talking)
    const normalizedPhone = targetNumber.replace(/\s+/g, "");

    try {
      const res = await fetch("/api/africastalking/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: normalizedPhone,
          message: smsMessage
        })
      });

      const data = await res.json();
      setSMSResult(data);

      if (data.success) {
        // Append history logs
        const newLog = {
          id: "C-" + Math.round(Math.random() * 9000 + 1000),
          type: "SMS" as const,
          recipient: normalizedPhone,
          targetName: getRecipientName(),
          payloadText: smsMessage,
          costKes: data.costKes || 0.8,
          timestamp: new Date().toISOString(),
          status: data.isSimulated ? ("Simulated" as const) : ("Success" as const)
        };
        setCommsHistory([newLog, ...commsHistory]);
      }
    } catch (err: any) {
      console.error("SMS processing error:", err);
      setSMSResult({ success: false, error: err.message || "Failed to contact SMS gateway." });
    } finally {
      setIsSendingSMS(false);
    }
  }

  // Action: Trigger phone call on server
  async function handleTriggerCall(e: React.FormEvent) {
    e.preventDefault();
    if (!voiceSpeech.trim() || !targetNumber) return;

    setIsCalling(true);
    setVoiceResult(null);

    // Normalize phone (remove whitespaces)
    const normalizedPhone = targetNumber.replace(/\s+/g, "");

    // Interactive dialer simulation loops which match premium design expectation
    setCallState("DIALING");
    
    // Periodically advance the simulated status
    const timer1 = setTimeout(() => setCallState("RINGING"), 1200);
    const timer2 = setTimeout(() => setCallState("ANSWERED"), 2800);
    const timer3 = setTimeout(() => setCallState("TTS_STREAMING"), 4400);

    try {
      const res = await fetch("/api/africastalking/make-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: normalizedPhone,
          textToSay: voiceSpeech
        })
      });

      const data = await res.json();
      
      // Delay finishing dialer animation to let human eyes read active stages
      setTimeout(() => {
        setCallState("COMPLETED");
        setVoiceResult(data);
        setIsCalling(false);

        if (data.success) {
          const newLog = {
            id: "C-" + Math.round(Math.random() * 9000 + 1000),
            type: "VOICE" as const,
            recipient: normalizedPhone,
            targetName: getRecipientName(),
            payloadText: voiceSpeech,
            costKes: 6.5, // Standard simulated telecom 1-minute voice billing KES
            timestamp: new Date().toISOString(),
            status: data.isSimulated ? ("Simulated" as const) : ("Success" as const)
          };
          setCommsHistory([newLog, ...commsHistory]);
        }
      }, 6000);

    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setCallState("IDLE");
      setVoiceResult({ success: false, error: err.message });
      setIsCalling(false);
    }
  }

  return (
    <div id="comms-modal-overlay" className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col text-slate-100 max-h-[90vh]">
        
        {/* Terminal Header Bar */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <Volume2 className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="text-sm font-extrabold tracking-tight">Africa's Talking (AT) Communications Hub</h2>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Universal Voice Call & SMS Gateway Node</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status indicator banner */}
        <div className="p-3 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between text-xs px-5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-slate-400 text-[11px] font-mono">
              Gateway: Africa's Talking (KCB/Safaricom Sandbox Circuit active)
            </span>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-350 py-0.5 px-2 rounded-md font-bold uppercase tracking-wide">
            Port: 3000 Webhook API
          </span>
        </div>

        {/* Modal Main Compartment Split */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-[480px]">
          
          {/* Left Column: Input Panel & Presets */}
          <div className="w-full md:w-[55%] p-6 border-r border-slate-800 overflow-y-auto space-y-5">
            
            {/* Nav Switch Segment */}
            <div className="grid grid-cols-3 bg-slate-950 p-1 rounded-xl border border-slate-850">
              <button
                type="button"
                onClick={() => { setActiveSegment("SMS"); setSMSResult(null); }}
                className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-lg transition-all ${
                  activeSegment === "SMS" ? "bg-slate-800 text-amber-400 shadow-sm" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                SMS Alerts
              </button>
              <button
                type="button"
                onClick={() => { setActiveSegment("VOICE"); setVoiceResult(null); }}
                className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-lg transition-all ${
                  activeSegment === "VOICE" ? "bg-slate-800 text-amber-400 shadow-sm" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                Voice Calls
              </button>
              <button
                type="button"
                onClick={() => setActiveSegment("SYSTEM_LOGS")}
                className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-lg transition-all ${
                  activeSegment === "SYSTEM_LOGS" ? "bg-slate-800 text-amber-400 shadow-sm" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                History & Logs
              </button>
            </div>

            {/* Recipient Selecion Block (not shown on pure system logs) */}
            {activeSegment !== "SYSTEM_LOGS" && (
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3.5">
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  🎯 Target Subscriber Preset
                </label>

                <div className="grid grid-cols-4 gap-1 select-none">
                  {(["farmer", "buyer", "driver", "custom"] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setRecipientType(type);
                        setSelectedPresetId("");
                      }}
                      className={`capitalize py-2 rounded-lg font-bold border text-[10.5px] transition-all ${
                        recipientType === type 
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/40" 
                          : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* Preset drop-downs */}
                {recipientType !== "custom" && (
                  <div>
                    <select
                      value={selectedPresetId}
                      onChange={(e) => setSelectedPresetId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 outline-none focus:border-amber-500 text-xs text-white"
                    >
                      {recipientType === "farmer" && farmers.map(f => (
                        <option key={f.id} value={f.id}>{f.name} ({f.primaryCrop}) - {f.phoneNumber}</option>
                      ))}
                      {recipientType === "buyer" && buyers.map(b => (
                        <option key={b.id} value={b.id}>{b.name} ({b.companyName}) - {b.phoneNumber}</option>
                      ))}
                      {recipientType === "driver" && drivers.map(d => (
                        <option key={d.id} value={d.id}>{d.name} (Plate: {d.vehicleId}) - {d.phoneNumber}</option>
                      ))}
                    </select>
                  </div>
                )}

                {recipientType === "custom" && (
                  <div>
                    <input
                      type="text"
                      placeholder="e.g. +254711000000"
                      value={manualPhone}
                      onChange={(e) => setManualPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 outline-none focus:border-amber-500 text-xs text-white font-mono"
                    />
                  </div>
                )}

                <div className="pt-2 flex justify-between items-center text-[11px] text-slate-400">
                  <span>Routing Path: <strong className="text-slate-200 font-mono">{targetNumber}</strong></span>
                  <span className="text-[10px] uppercase font-bold text-amber-500 pl-2 bg-amber-500/10 px-1.5 py-0.5 rounded">
                    {recipientType}
                  </span>
                </div>
              </div>
            )}

            {/* A. SMS MODULE VIEW */}
            {activeSegment === "SMS" && (
              <form onSubmit={handleSendSMS} className="space-y-4">
                
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">SMS Message Payload</label>
                  
                  <button
                    type="button"
                    onClick={() => generateAIAlertTemplate("SMS")}
                    disabled={isDraftingGemini}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg cursor-pointer transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isDraftingGemini ? "Drafting..." : "Draft with Gemini AI"}
                  </button>
                </div>

                {geminiStatus && (
                  <p className="text-[10.5px] text-amber-500 animate-pulse bg-amber-500/5 p-2 rounded-lg border border-amber-500/15">
                    {geminiStatus}
                  </p>
                )}

                <div className="relative">
                  <textarea
                    required
                    placeholder="Type your message description here. Keep below 160 characters for single segment billing..."
                    value={smsMessage}
                    onChange={(e) => setSMSMessage(e.target.value)}
                    rows={4}
                    maxLength={250}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 outline-none focus:border-amber-500 text-xs text-slate-100 placeholder-slate-500 font-sans resize-none leading-relaxed"
                  />
                  <div className="absolute bottom-3 right-3 text-[10px] text-slate-500 font-mono">
                    {smsMessage.length} / 160 chars
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSendingSMS || !smsMessage.trim() || isDraftingGemini}
                  className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 text-slate-950 font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer flex justify-center items-center gap-2 shadow-lg shadow-amber-500/10"
                >
                  <MessageSquare className="w-4 h-4 text-slate-950" />
                  {isSendingSMS ? "Invoking Safaricom SMS Gate..." : "Transmit Live SMS Alert"}
                </button>

                {/* API JSON Response Console Output */}
                {smsResult && (
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-2 font-mono">
                    <div className="flex items-center justify-between text-[10.5px]">
                      <span className="text-amber-400 font-extrabold flex items-center gap-1">
                        <Database className="w-3.5 h-3.5" /> GATEWAY RESPONSE:
                      </span>
                      <span className={`text-[9px] uppercase px-1.5 rounded ${smsResult.success ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                        {smsResult.success ? "Transmitted" : "Error"}
                      </span>
                    </div>

                    <pre className="text-[10px] text-slate-350 overflow-x-auto p-2 bg-slate-900 border border-slate-800 rounded max-h-[150px]">
                      {JSON.stringify(smsResult, null, 2)}
                    </pre>
                  </div>
                )}

              </form>
            )}

            {/* B. VOICE VOICE MODULE MODULE */}
            {activeSegment === "VOICE" && (
              <form onSubmit={handleTriggerCall} className="space-y-4">
                
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Robotic Text-to-Speech (TTS) Script</label>
                  
                  <button
                    type="button"
                    onClick={() => generateAIAlertTemplate("VOICE")}
                    disabled={isDraftingGemini}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg cursor-pointer transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isDraftingGemini ? "Drafting..." : "Draft with Gemini AI"}
                  </button>
                </div>

                {geminiStatus && (
                  <p className="text-[10.5px] text-amber-500 animate-pulse bg-amber-500/5 p-2 rounded-lg border border-amber-500/15">
                    {geminiStatus}
                  </p>
                )}

                <textarea
                  required
                  placeholder="Specify speech content. Africa's Talking automatic text-to-speech engine will synthesis this when recipient picks up the phone..."
                  value={voiceSpeech}
                  onChange={(e) => setVoiceSpeech(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 outline-none focus:border-amber-500 text-xs text-slate-100 placeholder-slate-500 font-sans resize-none leading-relaxed"
                />

                <button
                  type="submit"
                  disabled={isCalling || !voiceSpeech.trim() || isDraftingGemini}
                  className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 text-slate-950 font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer flex justify-center items-center gap-2 shadow-lg shadow-amber-500/10"
                >
                  <PhoneCall className="w-4 h-4 text-slate-950" />
                  {isCalling ? "Executing Telecom Dial Route..." : "Initiate Secure Voice Call"}
                </button>

                {/* ACTIVE DIALING CONTAINER POPUP (No popup alerts) */}
                {isCalling && (
                  <div className="p-4 bg-slate-950 border border-amber-500/20 rounded-xl flex items-center gap-4 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                      <Volume2 className="w-5 h-5 animate-bounce" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                        Active Call Tracker: {callState}
                      </p>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        Recipient: {targetNumber} ({getRecipientName()})
                      </span>
                      <p className="text-[9.5px] text-slate-300 mt-0.5 max-w-[90%] truncate">
                        Speech: "{voiceSpeech}"
                      </p>
                    </div>
                  </div>
                )}

                {/* Voice Call Results Terminal Log */}
                {voiceResult && (
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-2 font-mono">
                    <div className="flex items-center justify-between text-[10.5px]">
                      <span className="text-amber-400 font-extrabold flex items-center gap-1">
                        <Terminal className="w-3.5 h-3.5" /> CALL DETAIL RECORD (CDR):
                      </span>
                      <span className={`text-[8.5px] uppercase font-bold px-1.5 rounded ${voiceResult.success ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                        {voiceResult.success ? "Completed" : "Call Rejected"}
                      </span>
                    </div>

                    <pre className="text-[10px] text-slate-350 overflow-x-auto p-2 bg-slate-900 border border-slate-800 rounded max-h-[150px]">
                      {JSON.stringify(voiceResult, null, 2)}
                    </pre>
                  </div>
                )}

              </form>
            )}

            {/* C. SYSTEM HISTORY LOGS LIST */}
            {activeSegment === "SYSTEM_LOGS" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-lg border border-slate-850">
                  <span className="text-xs text-slate-400 font-bold">Trace Count: {commsHistory.length} nodes</span>
                  <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" /> Total Cost: KES {commsHistory.reduce((s, h) => s + h.costKes, 0).toFixed(2)}
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[350px] overflow-y-auto">
                  {commsHistory.map(log => (
                    <div key={log.id} className="p-3 bg-slate-950 border border-slate-850 rounded-lg space-y-1.5">
                      <div className="flex justify-between items-center text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-bold px-1.5 uppercase rounded-sm ${log.type === "SMS" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"}`}>
                            {log.type}
                          </span>
                          <strong className="text-slate-200">{log.targetName}</strong>
                          <span className="text-slate-500 font-mono text-[10px]">{log.recipient}</span>
                        </div>
                        <span className="text-slate-500 font-mono text-[10px]">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-300 font-sans leading-relaxed">
                        {log.payloadText}
                      </p>

                      <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-1">
                        <span>Trace ID: {log.id}</span>
                        <span>Billing: <strong className="text-amber-500 font-bold">KES {log.costKes.toFixed(2)}</strong> ({log.status})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Africa's Talking Developer Insights Banner */}
          <div className="w-full md:w-[45%] bg-slate-950 p-6 flex flex-col justify-between overflow-y-auto border-t md:border-t-0 border-slate-800">
            
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-300">
                <Compass className="w-4 h-4 text-amber-500 animate-spin" />
                <span>AT Integration Telemetry</span>
              </div>

              {/* API Info Blocks */}
              <div className="space-y-3 font-sans text-xs text-slate-300">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <strong className="text-amber-400 block mb-1">📞 Voice Callback Node</strong>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    When Africa's Talking dials your active transporter, it queries our live webserver. We serve an automated TTS response back in correct XML format.
                  </p>
                  <div className="mt-2 text-[10px] bg-slate-950 p-1.5 px-2.5 rounded font-mono text-slate-400 select-all">
                    POST /api/africastalking/voice-callback
                  </div>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <strong className="text-amber-400 block mb-1">🔗 Direct Sandbox / Prod Toggle</strong>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    The platform auto-detects if your environment keys are filled in Settings Secrets. If missing, it defaults to a clean, offline-safe interactive emulator so everything works out of the box!
                  </p>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <strong className="text-amber-400 block mb-1">📱 Ecosystem Quick Actions</strong>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Use Gemini AI in the left panel to formulate customized text alerts. When drivers verify load seals or cold capacities, AT automatically triggers safety SMS dispatches!
                  </p>
                </div>
              </div>
            </div>

            {/* Live sandbox status graphic */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2.5 mt-5 flex-shrink-0">
              <div className="flex items-center gap-1.5 text-[10.5px] font-mono text-slate-400 uppercase">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                <span>API Secrets Diagnostics</span>
              </div>
              
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Username:</span>
                  <span className="font-mono text-slate-200">{process.env.AFRICA_TALKING_USERNAME || "sandbox"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">API Key Status:</span>
                  <span className="font-mono text-amber-400 font-bold">Unconfigured (Simulation Mode)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">From / Virtual No:</span>
                  <span className="font-mono text-slate-400">Default Sandbox (+254711082002)</span>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-800 flex items-center gap-2 text-[10px] text-amber-400/90 leading-normal bg-amber-500/5 p-2 rounded">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-amber-500" />
                <span>To use real Safaricom lines, simply add <strong>AFRICA_TALKING_API_KEY</strong> inside your AI Studio Workspace Settings!</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
