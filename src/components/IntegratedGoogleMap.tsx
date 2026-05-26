import React, { useState } from "react";
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useAdvancedMarkerRef } from "@vis.gl/react-google-maps";
import { MapPin, Info, Compass, ShieldAlert, Key } from "lucide-react";

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  role: "COLLECTION" | "WAREHOUSE" | "BUYER" | "TRUCK" | "FARM";
  color?: string;
  description?: string;
}

interface IntegratedGoogleMapProps {
  center: { lat: number; lng: number };
  zoom: number;
  markers: MapMarker[];
  height?: string;
}

// Ensure support for multiple env injection pipelines
const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  "";

const hasValidKey = Boolean(API_KEY) && API_KEY !== "YOUR_API_KEY";

function MarkerWithInfo({ marker }: { marker: MapMarker; key?: string }) {
  const [markerRef, mInstance] = useAdvancedMarkerRef();
  const [isOpen, setIsOpen] = useState(false);

  // Set colors for various role profiles
  const markerColors: Record<string, string> = {
    COLLECTION: "#10b981", // Emerald
    WAREHOUSE: "#6366f1",  // Indigo
    BUYER: "#f59e0b",      // Amber
    TRUCK: "#ef4444",      // Red
    FARM: "#22c55e"        // Green
  };

  const color = marker.color || markerColors[marker.role] || "#3b82f6";

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: marker.lat, lng: marker.lng }}
        title={marker.title}
        onClick={() => setIsOpen(true)}
      >
        <Pin background={color} borderColor="#ffffff" glyphColor="#ffffff" scale={1.1} />
      </AdvancedMarker>
      {isOpen && (
        <InfoWindow anchor={mInstance} onCloseClick={() => setIsOpen(false)}>
          <div className="p-1 px-2 font-sans max-w-[200px] text-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Ref: {marker.role}
            </span>
            <strong className="text-xs text-slate-900 block font-bold mb-1">{marker.title}</strong>
            <p className="text-[11px] text-slate-500 leading-normal">{marker.description || "Active Node in Kenya Agrilogistics pipeline."}</p>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export default function IntegratedGoogleMap({ center, zoom, markers, height = "250px" }: IntegratedGoogleMapProps) {
  if (!hasValidKey) {
    // Beautiful splash design satisfying Constitution Rule 1C
    return (
      <div 
        style={{ height }}
        className="w-full bg-slate-900 rounded-xl relative border border-slate-800 text-slate-100 p-5 flex flex-col justify-between overflow-hidden"
      >
        {/* Abstract background grids */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative z-10 flex gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl h-fit border border-amber-500/20">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-400 flex items-center gap-1.5 leading-none">
              <ShieldAlert className="w-4 h-4" />
              Real Google Maps Link Blocked
            </h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              To activate real-time geographic routing, post-harvest warehouses localization, and live GPS transit waypoints, configure your credential secret.
            </p>
          </div>
        </div>

        {/* Step instructions */}
        <div className="relative z-10 p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl text-[11px] text-slate-300 space-y-1.5 font-sans leading-relaxed">
          <p className="font-semibold text-slate-200 flex items-center gap-1">
            <Key className="w-3.5 h-3.5 text-amber-500" />
            Establish Key in Settings:
          </p>
          <ol className="list-decimal pl-4 space-y-1 text-slate-400">
            <li>Open the <strong>Settings</strong> menu (⚙️ Gear Icon in the upper right corner)</li>
            <li>Select <strong>Secrets</strong>, type name: <code className="text-amber-400 font-mono text-[10px]">GOOGLE_MAPS_PLATFORM_KEY</code></li>
            <li>Paste your maps API key as value, and press <strong>Enter</strong></li>
          </ol>
          <p className="text-[9.5px] text-amber-500 italic mt-1 font-medium">✓ Applet rebuilds automatically – interactive map pins unlock immediately.</p>
        </div>

        {/* Mock Graphic visual mimicking active route */}
        <div className="relative z-5 flex items-center justify-between border-t border-slate-800 pt-3 text-[10px] text-slate-500">
          <span>Active Counties: Nyandarua, Meru, Nairobi</span>
          <span className="font-mono text-[9px] text-slate-600">Simulated Stage Engine active</span>
        </div>
      </div>
    );
  }

  // Render authentic Google Map with Attribution IDs according to Constitution Rule 2
  return (
    <APIProvider apiKey={API_KEY} version="weekly">
      <div style={{ height }} className="w-full rounded-xl overflow-hidden border border-slate-200">
        <Map
          defaultCenter={center}
          defaultZoom={zoom}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
        >
          {markers.map(m => (
            <MarkerWithInfo key={m.id} marker={m} />
          ))}
        </Map>
      </div>
    </APIProvider>
  );
}
