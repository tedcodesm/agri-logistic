import { Express } from "express";

export function registerMarketRoutes(app: Express) {
  app.post("/api/predict-price", async (req, res) => {
    const { cropName, county, grade } = req.body;

    const basePrices: Record<string, number> = {
      Maize: 40,
      Beans: 95,
      Potatoes: 32,
      Tomatoes: 65,
      Cabbage: 18,
      Avocados: 75,
    };

    const defaultPrice = 50;
    const pivot = basePrices[cropName] || defaultPrice;
    const gradeMultiplier = grade === "A" ? 1.25 : grade === "B" ? 1.0 : 0.75;
    const countyFactor = county === "Nairobi" ? 1.15 : county === "Uasin Gishu" ? 0.9 : 1.02;
    const predictedBase = Math.round(pivot * gradeMultiplier * countyFactor);

    const months = ["Dec", "Jan", "Feb", "Mar", "Apr", "May (Current)", "Jun (Proj)", "Jul (Proj)", "Aug (Proj)"];
    const historicalData = months.map((m, idx) => {
      const cycleFactor = 1 + 0.15 * Math.sin((idx / 3) * Math.PI);
      const deviation = (Math.random() - 0.5) * 4;
      return {
        month: m,
        priceKes: Math.max(8, Math.round(predictedBase * cycleFactor + deviation)),
        avgDemandTons: Math.round(150 + Math.sin(idx / 2) * 40),
      };
    });

    res.json({
      crop: cropName,
      predictedPricePerKg: predictedBase,
      optimalStorageTempCelsius: cropName === "Potatoes" ? 8 : cropName === "Tomatoes" ? 12 : 15,
      maxMoistureAllowedPct: cropName === "Maize" ? 13.5 : cropName === "Beans" ? 14 : 20,
      spoilageHorizonDays: cropName === "Tomatoes" ? 7 : cropName === "Potatoes" ? 45 : 120,
      historicalPricing: historicalData,
      regionalAnomalies: [
        { location: "Nairobi (Wakulima)", premiumPct: 20, activeBuyers: 45 },
        { location: "Wote Collection Center", premiumPct: -5, activeBuyers: 12 },
        { location: "Mombasa Terminal", premiumPct: 15, activeBuyers: 28 },
      ],
    });
  });
}
