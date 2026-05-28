export enum VerificationStatus {
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
}

export enum ProduceGrade {
  GRADE_A = "A", // Export & Premium domestic format
  GRADE_B = "B", // Standard food processing/local market
  GRADE_C = "C", // Local low-cost processing, near-term storage
}

export enum CargoStatus {
  READY_FOR_COLLECTION = "READY_FOR_COLLECTION",
  AGGREGATED = "AGGREGATED",
  IN_TRANSIT_WREHOUSE = "IN_TRANSIT_TO_WAREHOUSE",
  IN_WAREHOUSE = "IN_WAREHOUSE",
  IN_TRANSIT_BUYER = "IN_TRANSIT_TO_BUYER",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export enum PaymentMethod {
  M_PESA = "M_PESA",
  PESAPAL = "PESAPAL",
  CASH_ON_DELIVERY = "CASH_ON_DELIVERY",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

// core database and simulator structures
export interface Farmer {
  id: string;
  name: string;
  phoneNumber: string;
  location: {
    county: string;
    subCounty: string;
    latitude: number;
    longitude: number;
  };
  kycStatus: VerificationStatus;
  farmSizeAcres: number;
  primaryCrop: string;
}

export interface Buyer {
  id: string;
  name: string;
  companyName: string;
  phoneNumber: string;
  location: {
    city: string;
    latitude: number;
    longitude: number;
  };
  kycStatus: VerificationStatus;
}

export interface Driver {
  id: string;
  name: string;
  phoneNumber: string;
  licenseNumber: string;
  kycStatus: VerificationStatus;
  vehicleId: string;
  currentLat: number;
  currentLng: number;
  status: "IDLE" | "ON_TRIP" | "OFF_DUTY";
  walletBalance: number;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  type: "MOTOR_TRICYCLE" | "3_TON_TRUCK" | "10_TON_REEFER" | "CANTER";
  payloadCapacityKg: number;
  currentLoadKg: number;
  fuelEfficiencyKmpl: number; // km per liter
  tempControlled: boolean;
}

export interface ProduceListing {
  id: string;
  farmerId: string;
  cropName: string;
  quantityKg: number;
  quantityUnit?: "kg" | "tonnes";
  pricePerKgKes: number;
  priceUnit?: "kg" | "tonne";
  harvestDate: string;
  grade: ProduceGrade;
  category?: string;
  county?: string;
  storageType?: string;
  availabilityStatus?: "AVAILABLE" | "LIMITED" | "OUT_OF_STOCK";
  deliveryAvailable?: boolean;
  transportNeeded?: boolean;
  warehouseStatus?: "NOT_STORED" | "WAREHOUSE_PENDING" | "WAREHOUSE_VERIFIED";
  trustScore?: number;
  estimatedDeliveryEtaHours?: number;
  moistureContentPct: number;
  description: string;
  spoilageRiskPct: number;
  imageUrl?: string;
  imageUrls?: string[];
  isOfflineCreated?: boolean;
  syncStatus?: "PENDING" | "SYNCED";
  timestamp: string;
}

export interface Warehouse {
  id: string;
  name: string;
  county: string;
  totalCapacityKg: number;
  currentOccupancyKg: number;
  temperatureCelsius: number;
  humidityPct: number;
  gradeDistribution: {
    [key in ProduceGrade]: number; // in Kg
  };
}

export interface DeliveryTrip {
  id: string;
  orderId: string;
  driverId: string;
  vehicleId: string;
  routeCoordinates: [number, number][]; // array [lat, lng]
  currentLocationIndex: number;
  waypoints: {
    name: string;
    lat: number;
    lng: number;
    role: "COLLECTION" | "WAREHOUSE" | "BUYER";
    completed: boolean;
  }[];
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  etaMinutes: number;
  fuelConsumedLiters: number;
  deliveryProofCode?: string;
  status: "ASSIGNED" | "LOADING" | "TRANSIT" | "COMPLETED";
}

export interface Order {
  id: string;
  buyerId: string;
  listingIds: string[];
  totalQuantityKg: number;
  totalCostKes: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  mpesaReceipt?: string;
  status: CargoStatus;
  deliveryAddress: string;
  createdAt: string;
}

export interface LogisticsRequest {
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

export interface OfflineSyncItem {
  id: string;
  objectType: "PRODUCE_LISTING" | "ORDER" | "KYC_VERIFICATION";
  payload: any;
  createdAt: string;
  syncAttempts: number;
}

export interface Message {
  role: "user" | "model";
  text: string;
  isKiswahili?: boolean;
}
