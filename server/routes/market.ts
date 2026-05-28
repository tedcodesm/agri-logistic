import { Express } from "express";
import {
  createOrderWithLogistics,
  createProduct,
  deleteProduct,
  listLogisticsRequests,
  listOrders,
  listProducts,
  updateProduct,
} from "../db";
import { authGuard, AuthenticatedRequest } from "../middleware/authGuard";

export function registerMarketRoutes(app: Express) {
  app.get("/api/products", async (_req, res) => {
    const products = await listProducts();
    res.json({ products });
  });

  app.post("/api/products", authGuard, async (req: AuthenticatedRequest, res) => {
    if (req.authUser?.role !== "farmer" && req.authUser?.role !== "admin") {
      res.status(403).json({ error: "Only farmers can create listings." });
      return;
    }
    const body = req.body || {};
    if (!body.cropName || !body.quantityKg || !body.pricePerKgKes) {
      res.status(400).json({ error: "Missing cropName, quantityKg, or pricePerKgKes." });
      return;
    }
    const product = await createProduct({
      farmerId: body.farmerId || "F-101",
      cropName: body.cropName,
      quantityKg: Number(body.quantityKg),
      quantityUnit: body.quantityUnit || "kg",
      pricePerKgKes: Number(body.pricePerKgKes),
      priceUnit: body.priceUnit || "kg",
      category: body.category || "General",
      county: body.county || "Nairobi",
      storageType: body.storageType || "Warehouse",
      harvestDate: body.harvestDate || new Date().toISOString().slice(0, 10),
      availabilityStatus: body.availabilityStatus || "AVAILABLE",
      deliveryAvailable: Boolean(body.deliveryAvailable),
      transportNeeded: Boolean(body.transportNeeded),
      warehouseStatus: body.warehouseStatus || "WAREHOUSE_PENDING",
      moistureContentPct: Number(body.moistureContentPct || 0),
      description: body.description || "",
      spoilageRiskPct: Number(body.spoilageRiskPct || 5),
      imageUrl: body.imageUrl,
      imageUrls: body.imageUrls || [],
      trustScore: Number(body.trustScore || 92),
      estimatedDeliveryEtaHours: Number(body.estimatedDeliveryEtaHours || 6),
      grade: body.grade || "A",
    });
    res.status(201).json({ product });
  });

  app.patch("/api/products/:id", authGuard, async (req: AuthenticatedRequest, res) => {
    const farmerId = String(req.body.farmerId || "F-101");
    const updated = await updateProduct(req.params.id, farmerId, req.body || {});
    if (!updated) {
      res.status(404).json({ error: "Listing not found." });
      return;
    }
    res.json({ product: updated });
  });

  app.delete("/api/products/:id", authGuard, async (req: AuthenticatedRequest, res) => {
    const farmerId = String(req.query.farmerId || "F-101");
    const ok = await deleteProduct(req.params.id, farmerId);
    if (!ok) {
      res.status(404).json({ error: "Listing not found." });
      return;
    }
    res.json({ success: true });
  });

  app.get("/api/orders", authGuard, async (_req, res) => {
    const orders = await listOrders();
    res.json({ orders });
  });

  app.post("/api/orders", authGuard, async (req: AuthenticatedRequest, res) => {
    if (req.authUser?.role !== "buyer" && req.authUser?.role !== "admin") {
      res.status(403).json({ error: "Only buyers can place orders." });
      return;
    }
    const body = req.body || {};
    if (!body.id || !body.buyerId || !body.listingIds?.length) {
      res.status(400).json({ error: "Invalid order payload." });
      return;
    }
    const result = await createOrderWithLogistics({
      id: body.id,
      buyerId: body.buyerId,
      listingIds: body.listingIds,
      totalQuantityKg: Number(body.totalQuantityKg),
      totalCostKes: Number(body.totalCostKes),
      paymentMethod: body.paymentMethod,
      paymentStatus: body.paymentStatus,
      status: body.status,
      deliveryAddress: body.deliveryAddress,
      createdAt: body.createdAt || new Date().toISOString(),
    });
    res.status(201).json(result);
  });

  app.get("/api/logistics/requests", authGuard, async (_req, res) => {
    const requests = await listLogisticsRequests();
    res.json({ requests });
  });

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
