const IMAGE_BY_CROP: Record<string, string> = {
  maize: "/assets/products/maize-grain.jpg",
  corn: "/assets/products/maize-grain.jpg",
  potato: "/assets/products/irish-potatoes.jpg",
  potatoes: "/assets/products/irish-potatoes.jpg",
  "irish potato": "/assets/products/irish-potatoes.jpg",
  "irish potatoes": "/assets/products/irish-potatoes.jpg",
  "sweet potato": "/assets/products/irish-potatoes.jpg",
  "sweet potatoes": "/assets/products/irish-potatoes.jpg",
  avocado: "/assets/products/hass-avocado.jpg",
  avocados: "/assets/products/hass-avocado.jpg",
  "hass avocado": "/assets/products/hass-avocado.jpg",
  "hass avocados": "/assets/products/hass-avocado.jpg",
  tomato: "/assets/products/tomatoes-fresh.jpg",
  tomatoes: "/assets/products/tomatoes-fresh.jpg",
};

export function getProductImage(cropName: string, preferredUrl?: string, allowFallback = true) {
  const isInvalidPreferred =
    !preferredUrl ||
    preferredUrl.startsWith("blob:") ||
    preferredUrl.includes("images.unsplash.com");
  if (!isInvalidPreferred) return preferredUrl;
  if (!allowFallback) return "";
  const key = cropName.trim().toLowerCase();
  return IMAGE_BY_CROP[key] || "";
}
