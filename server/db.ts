import { MongoClient, Db } from "mongodb";

// Real-time temporary data fallback for clean client-side preview and testing
interface SimulatedUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: "farmer" | "buyer" | "driver" | "admin";
}

interface SimulatedProduct {
  id: string;
  farmerId: string;
  cropName: string;
  quantityKg: number;
  quantityUnit: "kg" | "tonnes";
  pricePerKgKes: number;
  priceUnit: "kg" | "tonne";
  category: string;
  county: string;
  storageType: string;
  harvestDate: string;
  availabilityStatus: "AVAILABLE" | "LIMITED" | "OUT_OF_STOCK";
  deliveryAvailable: boolean;
  transportNeeded: boolean;
  warehouseStatus: "NOT_STORED" | "WAREHOUSE_PENDING" | "WAREHOUSE_VERIFIED";
  moistureContentPct: number;
  description: string;
  spoilageRiskPct: number;
  imageUrl?: string;
  imageUrls?: string[];
  trustScore: number;
  estimatedDeliveryEtaHours: number;
  grade: "A" | "B" | "C";
  timestamp: string;
}

interface SimulatedOrder {
  id: string;
  buyerId: string;
  listingIds: string[];
  totalQuantityKg: number;
  totalCostKes: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  deliveryAddress: string;
  createdAt: string;
}

interface SimulatedLogisticsRequest {
  id: string;
  orderId: string;
  listingId: string;
  buyerId: string;
  farmerId: string;
  countyFrom: string;
  countyTo: string;
  transportCostKes: number;
  routeEtaHours: number;
  status: "REQUESTED" | "ASSIGNED" | "IN_TRANSIT" | "DELIVERED";
  createdAt: string;
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

// In-memory fallback users database to prevent applet failures before DB is online
const inMemoryUsers: SimulatedUser[] = [
  {
    id: "U-1",
    email: "farmer@agrilogistics.ke",
    passwordHash: "password123", // Simple validation for preview sandbox
    name: "Grace Wanjiku",
    role: "farmer",
  },
  {
    id: "U-2",
    email: "buyer@agrilogistics.ke",
    passwordHash: "password123",
    name: "Peter Mwangi",
    role: "buyer",
  },
  {
    id: "U-3",
    email: "driver@agrilogistics.ke",
    passwordHash: "password123",
    name: "Samson Kiprop",
    role: "driver",
  },
  {
    id: "U-4",
    email: "admin@agrilogistics.ke",
    passwordHash: "password123",
    name: "Operator Chief",
    role: "admin",
  }
];

const inMemoryProducts: SimulatedProduct[] = [
  {
    id: "L-601",
    farmerId: "F-101",
    cropName: "Maize",
    quantityKg: 2400,
    quantityUnit: "kg",
    pricePerKgKes: 42,
    priceUnit: "kg",
    category: "Grains",
    county: "Uasin Gishu",
    storageType: "Dry Silo",
    harvestDate: new Date().toISOString().slice(0, 10),
    availabilityStatus: "AVAILABLE",
    deliveryAvailable: true,
    transportNeeded: false,
    warehouseStatus: "WAREHOUSE_VERIFIED",
    moistureContentPct: 13.2,
    description: "Grade A dry maize batch from Eldoret belt.",
    spoilageRiskPct: 6,
    imageUrl: "https://images.unsplash.com/photo-1601593768799-76d53f38b5f8?w=800&auto=format&fit=crop",
    imageUrls: ["https://images.unsplash.com/photo-1601593768799-76d53f38b5f8?w=800&auto=format&fit=crop"],
    trustScore: 96,
    estimatedDeliveryEtaHours: 8,
    grade: "A",
    timestamp: new Date().toISOString(),
  },
];

const inMemoryOrders: SimulatedOrder[] = [];
const inMemoryLogisticsRequests: SimulatedLogisticsRequest[] = [];

export async function getDatabase(): Promise<{ db: Db | null; isFallback: boolean }> {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri === "YOUR_MONGODB_URI") {
    return { db: null, isFallback: true };
  }

  try {
    if (cachedDb) {
      return { db: cachedDb, isFallback: false };
    }

    // Lazy initialization of the MongoDB client to avoid module load crashes
    const client = new MongoClient(uri, {
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });

    await client.connect();
    const dbName = uri.split("/").pop()?.split("?")[0] || "agrilogistics";
    const db = client.db(dbName);
    cachedClient = client;
    cachedDb = db;
    
    console.log(`Successfully connected to MongoDB database index: ${dbName}`);
    return { db, isFallback: false };
  } catch (error) {
    console.error("MongoDB Connection Failed! Defaulting gracefully to simulated environment:", error);
    return { db: null, isFallback: true };
  }
}

// User helper actions with seamless fallback logic
export async function findUserByEmail(email: string) {
  const { db, isFallback } = await getDatabase();
  
  if (isFallback || !db) {
    const found = inMemoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    return found || null;
  }
  
  const usersCollection = db.collection("users");
  return await usersCollection.findOne({ email: email.toLowerCase() });
}

export async function registerNewUser(email: string, passwordHash: string, name: string, role: "farmer" | "buyer" | "driver" | "admin") {
  const { db, isFallback } = await getDatabase();
  const newUser: SimulatedUser = {
    id: "U-" + Math.round(Math.random() * 10000 + 1000),
    email: email.toLowerCase(),
    passwordHash,
    name,
    role
  };

  if (isFallback || !db) {
    // Add to local list
    inMemoryUsers.push(newUser);
    return newUser;
  }

  const usersCollection = db.collection("users");
  // Check if exists
  const existing = await usersCollection.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new Error("User with this email already exists.");
  }

  await usersCollection.insertOne({
    id: newUser.id,
    email: newUser.email,
    passwordHash: newUser.passwordHash,
    name: newUser.name,
    role: newUser.role,
    createdAt: new Date()
  });

  return newUser;
}

export async function listAllRegisteredUsers() {
  const { db, isFallback } = await getDatabase();
  if (isFallback || !db) {
    return inMemoryUsers;
  }
  
  const usersCollection = db.collection("users");
  return await usersCollection.find({}).project({ passwordHash: 0 }).toArray();
}

export async function listProducts() {
  const { db, isFallback } = await getDatabase();
  if (isFallback || !db) return inMemoryProducts;
  return await db.collection("products").find({}).sort({ timestamp: -1 }).toArray();
}

export async function createProduct(payload: Omit<SimulatedProduct, "id" | "timestamp">) {
  const { db, isFallback } = await getDatabase();
  const product: SimulatedProduct = {
    ...payload,
    id: "L-" + Math.round(Math.random() * 90000 + 10000),
    timestamp: new Date().toISOString(),
  };
  if (isFallback || !db) {
    inMemoryProducts.unshift(product);
    return product;
  }
  await db.collection("products").insertOne(product);
  return product;
}

export async function updateProduct(productId: string, farmerId: string, patch: Partial<SimulatedProduct>) {
  const { db, isFallback } = await getDatabase();
  if (isFallback || !db) {
    const idx = inMemoryProducts.findIndex((p) => p.id === productId && p.farmerId === farmerId);
    if (idx < 0) return null;
    inMemoryProducts[idx] = { ...inMemoryProducts[idx], ...patch };
    return inMemoryProducts[idx];
  }
  const result = await db.collection("products").findOneAndUpdate(
    { id: productId, farmerId },
    { $set: patch },
    { returnDocument: "after" }
  );
  return result;
}

export async function deleteProduct(productId: string, farmerId: string) {
  const { db, isFallback } = await getDatabase();
  if (isFallback || !db) {
    const before = inMemoryProducts.length;
    const next = inMemoryProducts.filter((p) => !(p.id === productId && p.farmerId === farmerId));
    inMemoryProducts.splice(0, inMemoryProducts.length, ...next);
    return before !== inMemoryProducts.length;
  }
  const result = await db.collection("products").deleteOne({ id: productId, farmerId });
  return result.deletedCount > 0;
}

export async function listOrders() {
  const { db, isFallback } = await getDatabase();
  if (isFallback || !db) return inMemoryOrders;
  return await db.collection("orders").find({}).sort({ createdAt: -1 }).toArray();
}

export async function listLogisticsRequests() {
  const { db, isFallback } = await getDatabase();
  if (isFallback || !db) return inMemoryLogisticsRequests;
  return await db.collection("logisticsRequests").find({}).sort({ createdAt: -1 }).toArray();
}

export async function createOrderWithLogistics(order: SimulatedOrder) {
  const { db, isFallback } = await getDatabase();
  const primaryListing = inMemoryProducts.find((p) => p.id === order.listingIds[0]);
  const logistics: SimulatedLogisticsRequest = {
    id: "LR-" + Math.round(Math.random() * 90000 + 10000),
    orderId: order.id,
    listingId: order.listingIds[0] || "",
    buyerId: order.buyerId,
    farmerId: primaryListing?.farmerId || "F-101",
    countyFrom: primaryListing?.county || "Nakuru",
    countyTo: "Nairobi",
    transportCostKes: Math.round(order.totalQuantityKg * 4.8),
    routeEtaHours: Math.max(4, Math.round(order.totalQuantityKg / 420)),
    status: "REQUESTED",
    createdAt: new Date().toISOString(),
  };

  if (isFallback || !db) {
    inMemoryOrders.unshift(order);
    inMemoryLogisticsRequests.unshift(logistics);
    const purchased = new Set(order.listingIds);
    inMemoryProducts.forEach((p) => {
      if (purchased.has(p.id)) {
        p.quantityKg = Math.max(0, p.quantityKg - order.totalQuantityKg);
        p.availabilityStatus = p.quantityKg === 0 ? "OUT_OF_STOCK" : p.quantityKg < 500 ? "LIMITED" : "AVAILABLE";
      }
    });
    return { order, logistics };
  }

  await db.collection("orders").insertOne(order);
  await db.collection("logisticsRequests").insertOne(logistics);
  await db.collection("products").updateMany(
    { id: { $in: order.listingIds } },
    [{ $set: { quantityKg: { $max: [0, { $subtract: ["$quantityKg", order.totalQuantityKg] }] } } }]
  );
  return { order, logistics };
}
