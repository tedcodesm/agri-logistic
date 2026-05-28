let cachedMapsKey: string | undefined;
let loadingPromise: Promise<string> | null = null;

function readInlineKey(): string {
  return (
    (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
    (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
    (process as any)?.env?.GOOGLE_MAPS_PLATFORM_KEY ||
    ""
  );
}

export function isValidGoogleMapsKey(key: string) {
  return Boolean(key) && key !== "YOUR_API_KEY";
}

export async function getGoogleMapsKey(): Promise<string> {
  if (cachedMapsKey !== undefined) return cachedMapsKey;

  const inlineKey = readInlineKey();
  if (inlineKey) {
    cachedMapsKey = inlineKey;
    return inlineKey;
  }

  if (loadingPromise) return loadingPromise;

  loadingPromise = fetch("/api/config/maps-key")
    .then((r) => (r.ok ? r.json() : Promise.resolve({ apiKey: "" })))
    .then((d) => String(d?.apiKey || ""))
    .catch(() => "")
    .then((key) => {
      cachedMapsKey = key;
      return key;
    })
    .finally(() => {
      loadingPromise = null;
    });

  return loadingPromise;
}
