import React, { useState } from "react";
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useAdvancedMarkerRef } from "@vis.gl/react-google-maps";
import { Compass } from "lucide-react";
import { getGoogleMapsKey, isValidGoogleMapsKey } from "../lib/mapsKey";

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
  const [apiKey, setApiKey] = React.useState("");

  React.useEffect(() => {
    getGoogleMapsKey().then(setApiKey);
  }, []);

  const hasValidKey = isValidGoogleMapsKey(apiKey);

  if (!hasValidKey) {
    return (
      <div
        style={{ height, minHeight: height }}
        className="w-full rounded-xl relative border border-slate-200 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden"
      >
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]" />
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
          <path d="M 40 120 Q 120 40 200 100 T 360 60" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="8 6" />
          <circle cx="40" cy="120" r="8" fill="#22c55e" />
          <circle cx="200" cy="100" r="10" fill="#f59e0b" />
          <circle cx="360" cy="60" r="8" fill="#3b82f6" />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-sm border-t border-slate-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Compass className="w-4 h-4 text-agri-emerald shrink-0" />
            <span>Live route preview · {markers.length} active nodes</span>
          </div>
          <span className="text-[10px] font-semibold text-agri-emerald uppercase tracking-wide">Simulated map</span>
        </div>
      </div>
    );
  }

  // Render authentic Google Map with Attribution IDs according to Constitution Rule 2
  return (
    <APIProvider apiKey={apiKey} version="weekly">
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
