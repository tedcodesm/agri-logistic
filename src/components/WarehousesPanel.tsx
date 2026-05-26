import React, { useState } from "react";
import { 
  Building2, 
  Thermometer, 
  Droplets, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  Wind, 
  Compass, 
  CheckCircle,
  TrendingDown
} from "lucide-react";
import { Warehouse, ProduceGrade } from "../types";

interface WarehousesPanelProps {
  warehouses: Warehouse[];
  onAdjustClimate: (warehouseId: string, tempDelta: number, humDelta: number) => void;
}

export default function WarehousesPanel({ warehouses, onAdjustClimate }: WarehousesPanelProps) {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("W-501");
  const [overrideActive, setOverrideActive] = useState<boolean>(false);
  const [traceLogs, setTraceLogs] = useState<string[]>([
    "System check: Climate controllers online.",
    "Biotrace check: Uasin Gishu grain mold levels are minimal (aflatoxins zero index)."
  ]);

  const currentWarehouse = warehouses.find(w => w.id === selectedWarehouseId) || warehouses[0];

  function runVentilationOverride() {
    // Subtract temperature and humidity towards nominal safe targets
    onAdjustClimate(selectedWarehouseId, -0.5, -2);
    setOverrideActive(true);
    setTraceLogs(prev => [
      `[${new Date().toLocaleTimeString()}] Overrode ventilation on ${currentWarehouse.name}. Air fans set to HIGH.`,
      ...prev
    ]);
    setTimeout(() => setOverrideActive(false), 2000);
  }

  function runMoistureSanitySensor() {
    const randomMoisture = (12.5 + Math.random() * 2).toFixed(1);
    const criticalState = parseFloat(randomMoisture) > 13.5 ? "⚠️ CRITICAL MOLD HAZARD" : "✓ SECURE DRY CLASSIF";
    setTraceLogs(prev => [
      `[${new Date().toLocaleTimeString()}] Eldoret Grain moisture validation trace: ${randomMoisture}% moisture - ${criticalState}.`,
      ...prev
    ]);
  }

  return (
    <div id="warehouse-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
      
      {/* LEFT COLUMN: Warehouse Selector List */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
          Regional Depot Facilities
        </span>

        <div className="flex flex-col gap-3">
          {warehouses.map(w => {
            const isCritical = w.humidityPct > 85 && w.temperatureCelsius > 12;
            return (
              <button
                key={w.id}
                id={`wh-btn-${w.id}`}
                onClick={() => setSelectedWarehouseId(w.id)}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  selectedWarehouseId === w.id
                    ? "bg-slate-800 border-slate-900 text-white shadow-md"
                    : "bg-white border-slate-100 hover:border-slate-200 text-slate-700"
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <div>
                    <h4 className="font-bold text-sm tracking-tight">{w.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-1">📍 {w.county} County</p>
                  </div>
                  <Building2 className={`w-4 h-4 ${selectedWarehouseId === w.id ? "text-emerald-400" : "text-slate-400"}`} />
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100/10 flex justify-between items-center text-xs w-full">
                  <span className="text-[11px] text-slate-400">Total Holdings:</span>
                  <strong className={selectedWarehouseId === w.id ? "text-white" : "text-slate-800"}>
                    {w.currentOccupancyKg.toLocaleString()} / {w.totalCapacityKg.toLocaleString()} Kg
                  </strong>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: Active Depot Control panel & Climate overrides */}
      <div className="lg:col-span-8 flex flex-col gap-5">
        
        {/* Main Climate Sensor Gauge Display */}
        <div id="climate-card" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start border-b border-slate-50 pb-3 mb-5">
            <div>
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                Climate Guard Console: {currentWarehouse.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Automated sensor array tracking post-harvest spoilage risks</p>
            </div>
            
            <button
              id="ventilation-override-btn"
              onClick={runVentilationOverride}
              className={`flex items-center gap-1 text-[11px] font-semibold text-white px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                overrideActive ? "bg-emerald-500 animate-pulse" : "bg-slate-800 hover:bg-slate-950"
              }`}
            >
              <Wind className="w-3.5 h-3.5" />
              Adjust Air Fans Override
            </button>
          </div>

          {/* GAUGE CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* TEMPERATURE */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-150 flex items-center gap-4">
              <div className="p-3 bg-red-100 text-red-700 rounded-xl">
                <Thermometer className="w-6 h-6 font-bold" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Sensor Temperature</span>
                <strong className="text-slate-800 text-2xl font-mono">{currentWarehouse.temperatureCelsius.toFixed(1)}°C</strong>
                
                {/* Visual comfort bar */}
                <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                  <div 
                    className={`h-full ${currentWarehouse.id === "W-502" ? "bg-amber-400" : "bg-sky-400"}`} 
                    style={{ width: `${currentWarehouse.temperatureCelsius * 5}%` }} 
                  />
                </div>
                <span className="text-[9px] text-slate-400 mt-1 block">Optimal Threshold target: 6°C - 15°C</span>
              </div>
            </div>

            {/* RELATIVE HUMIDITY */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-150 flex items-center gap-4">
              <div className="p-3 bg-sky-100 text-sky-700 rounded-xl">
                <Droplets className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Relative Air Humidity</span>
                <strong className="text-slate-800 text-2xl font-mono">{currentWarehouse.humidityPct.toFixed(1)}%</strong>
                
                {/* Visual moisture comfort bar */}
                <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                  <div 
                    className={`h-full ${currentWarehouse.humidityPct > 80 ? "bg-red-500 animate-pulse" : "bg-sky-400"}`} 
                    style={{ width: `${currentWarehouse.humidityPct}%` }} 
                  />
                </div>
                <p className="text-[9px] text-slate-400 mt-1 flex justify-between">
                  <span>Target: &lt; 13.5% (Maize) | &lt; 85% (Potato)</span>
                  {currentWarehouse.humidityPct > 80 && <span className="text-red-500 font-bold uppercase tracking-tighter">Condensation Alert</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Grade holding split volume bars */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-tight block mb-4">
              Quality Grade Holdings Distribution (Kg)
            </span>

            <div className="space-y-3">
              {Object.entries(currentWarehouse.gradeDistribution).map(([gradeKey, val]) => {
                const pct = Math.round((val / currentWarehouse.currentOccupancyKg) * 100);
                return (
                  <div key={gradeKey} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-700">
                      <span>Grade {gradeKey} (Premium / Export)</span>
                      <strong>{val.toLocaleString()} Kg • {pct}%</strong>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          gradeKey === ProduceGrade.GRADE_A 
                            ? "bg-emerald-500" 
                            : gradeKey === ProduceGrade.GRADE_B 
                              ? "bg-sky-500" 
                              : "bg-amber-400"
                        }`} 
                        style={{ width: `${pct}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sensory Traces Audit Log */}
        <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 text-white flex flex-col h-[230px]">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2.5 mb-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              Moisture & Grading Audit Console Logs
            </h5>
            
            <button
              id="raw-trace-btn"
              onClick={runMoistureSanitySensor}
              className="text-[9px] uppercase font-bold text-white bg-slate-800 border border-slate-700 hover:bg-slate-750 px-2.5 py-1 rounded"
            >
              Trace Moisture sensor
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 font-mono text-[10.5px] text-slate-300 pr-1">
            {traceLogs.map((log, index) => (
              <div key={index} className="leading-relaxed border-l-2 border-emerald-500/30 pl-2">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
