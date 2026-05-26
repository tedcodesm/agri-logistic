import { MongoClient, Db } from "mongodb";

// Real-time temporary data fallback for clean client-side preview and testing
interface SimulatedUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: "farmer" | "buyer" | "driver" | "admin";
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
