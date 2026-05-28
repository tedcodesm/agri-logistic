import { 
  Farmer, 
  Buyer, 
  Driver, 
  Vehicle, 
  Warehouse, 
  ProduceListing, 
  DeliveryTrip, 
  Order, 
  VerificationStatus, 
  ProduceGrade,
  CargoStatus,
  PaymentMethod,
  PaymentStatus
} from "./types";

// Seed Farmers
export const SEED_FARMERS: Farmer[] = [
  {
    id: "F-101",
    name: "Josphat Kiprono",
    phoneNumber: "+254 712 345678",
    location: {
      county: "Uasin Gishu",
      subCounty: "Moiben",
      latitude: 0.528,
      longitude: 35.269,
    },
    kycStatus: VerificationStatus.VERIFIED,
    farmSizeAcres: 12,
    primaryCrop: "Maize",
  },
  {
    id: "F-102",
    name: "Mary Atieno",
    phoneNumber: "+254 722 987654",
    location: {
      county: "Meru",
      subCounty: "Imenti South",
      latitude: -0.047,
      longitude: 37.649,
    },
    kycStatus: VerificationStatus.VERIFIED,
    farmSizeAcres: 4.5,
    primaryCrop: "Avocados",
  },
  {
    id: "F-103",
    name: "Grace Wanjiku",
    phoneNumber: "+254 733 445566",
    location: {
      county: "Nyandarua",
      subCounty: "Kinangop",
      latitude: -0.638,
      longitude: 36.608,
    },
    kycStatus: VerificationStatus.VERIFIED,
    farmSizeAcres: 6,
    primaryCrop: "Potatoes",
  },
  {
    id: "F-104",
    name: "Ezekiel Mutua",
    phoneNumber: "+254 799 112233",
    location: {
      county: "Makueni",
      subCounty: "Wote",
      latitude: -1.780,
      longitude: 37.629,
    },
    kycStatus: VerificationStatus.PENDING,
    farmSizeAcres: 15,
    primaryCrop: "Tomatoes",
  }
];

// Seed Buyers
export const SEED_BUYERS: Buyer[] = [
  {
    id: "B-201",
    name: "Nairobi Fresh Wholesalers",
    companyName: "Nairobi Fresh Agro Distributors",
    phoneNumber: "+254 701 556677",
    location: {
      city: "Nairobi",
      latitude: -1.292,
      longitude: 36.821,
    },
    kycStatus: VerificationStatus.VERIFIED,
  },
  {
    id: "B-202",
    name: "Eldoret Grain Millers",
    companyName: "Ungu Limited",
    phoneNumber: "+254 705 990011",
    location: {
      city: "Eldoret",
      latitude: 0.514,
      longitude: 35.269,
    },
    kycStatus: VerificationStatus.VERIFIED,
  },
  {
    id: "B-203",
    name: "Naivas Supermarket Aggregators",
    companyName: "Naivas Ltd Procurement",
    phoneNumber: "+254 720 334455",
    location: {
      city: "Nairobi",
      latitude: -1.285,
      longitude: 36.815,
    },
    kycStatus: VerificationStatus.VERIFIED,
  }
];

// Seed Drivers + Vehicles
export const SEED_DRIVERS: Driver[] = [
  {
    id: "D-301",
    name: "Peter Mwangi",
    phoneNumber: "+254 711 223344",
    licenseNumber: "DL-908726-N",
    kycStatus: VerificationStatus.VERIFIED,
    vehicleId: "V-401",
    currentLat: -0.638,
    currentLng: 36.608,
    status: "IDLE",
    walletBalance: 12500,
  },
  {
    id: "D-302",
    name: "Salim Amin",
    phoneNumber: "+254 722 556677",
    licenseNumber: "DL-654321-M",
    kycStatus: VerificationStatus.VERIFIED,
    vehicleId: "V-402",
    currentLat: 0.528,
    currentLng: 35.269,
    status: "IDLE",
    walletBalance: 24700,
  },
  {
    id: "D-303",
    name: "David Omondi",
    phoneNumber: "+254 733 889900",
    licenseNumber: "DL-112233-X",
    kycStatus: VerificationStatus.VERIFIED,
    vehicleId: "V-403",
    currentLat: -1.780,
    currentLng: 37.629,
    status: "IDLE",
    walletBalance: 4200,
  }
];

export const SEED_VEHICLES: Vehicle[] = [
  {
    id: "V-401",
    plateNumber: "KBX 901M",
    type: "3_TON_TRUCK",
    payloadCapacityKg: 3000,
    currentLoadKg: 0,
    fuelEfficiencyKmpl: 7.5,
    tempControlled: false,
  },
  {
    id: "V-402",
    plateNumber: "KDD 450P",
    type: "10_TON_REEFER",
    payloadCapacityKg: 10000,
    currentLoadKg: 0,
    fuelEfficiencyKmpl: 4.2,
    tempControlled: true,
  },
  {
    id: "V-403",
    plateNumber: "KMCD 102A",
    type: "MOTOR_TRICYCLE",
    payloadCapacityKg: 800,
    currentLoadKg: 0,
    fuelEfficiencyKmpl: 18.0,
    tempControlled: false,
  }
];

// Seed Warehouses / Aggregation Centers
export const SEED_WAREHOUSES: Warehouse[] = [
  {
    id: "W-501",
    name: "Nyandarua Potato Depository",
    county: "Nyandarua",
    totalCapacityKg: 50000,
    currentOccupancyKg: 18400,
    temperatureCelsius: 8.5,
    humidityPct: 88,
    gradeDistribution: {
      [ProduceGrade.GRADE_A]: 11000,
      [ProduceGrade.GRADE_B]: 5800,
      [ProduceGrade.GRADE_C]: 1600,
    }
  },
  {
    id: "W-502",
    name: "Eldoret Grain Elevator Silo",
    county: "Uasin Gishu",
    totalCapacityKg: 150000,
    currentOccupancyKg: 89000,
    temperatureCelsius: 16.0,
    humidityPct: 12.8, // safe for maize preservation
    gradeDistribution: {
      [ProduceGrade.GRADE_A]: 62000,
      [ProduceGrade.GRADE_B]: 21000,
      [ProduceGrade.GRADE_C]: 6000,
    }
  },
  {
    id: "W-503",
    name: "Meru Fresh Avocado Terminal",
    county: "Meru",
    totalCapacityKg: 30000,
    currentOccupancyKg: 12500,
    temperatureCelsius: 6.0,
    humidityPct: 82,
    gradeDistribution: {
      [ProduceGrade.GRADE_A]: 8500,
      [ProduceGrade.GRADE_B]: 3000,
      [ProduceGrade.GRADE_C]: 1000,
    }
  },
  {
    id: "W-504",
    name: "Wote Last-Mile Collection Center",
    county: "Makueni",
    totalCapacityKg: 20000,
    currentOccupancyKg: 4500,
    temperatureCelsius: 14.5,
    humidityPct: 75,
    gradeDistribution: {
      [ProduceGrade.GRADE_A]: 1200,
      [ProduceGrade.GRADE_B]: 2500,
      [ProduceGrade.GRADE_C]: 800,
    }
  }
];

// Initial Produce Listings
export const SEED_LISTINGS: ProduceListing[] = [
  {
    id: "L-601",
    farmerId: "F-101",
    cropName: "Maize",
    quantityKg: 2400,
    pricePerKgKes: 38,
    harvestDate: "2026-05-18",
    grade: ProduceGrade.GRADE_A,
    moistureContentPct: 13.2,
    description: "Moiben highland dry corn. Well sorted, moisture verified below 13.5%.",
    spoilageRiskPct: 3,
    imageUrl: "/assets/products/maize-grain.jpg",
    syncStatus: "SYNCED",
    timestamp: "2026-05-18T12:00:00Z",
  },
  {
    id: "L-602",
    farmerId: "F-103",
    cropName: "Potatoes",
    quantityKg: 4500,
    pricePerKgKes: 30,
    harvestDate: "2026-05-19",
    grade: ProduceGrade.GRADE_B,
    moistureContentPct: 18.5,
    description: "Shangi potato variety. Hand-picked from clean fertile soils in Kinangop.",
    spoilageRiskPct: 12,
    imageUrl: "/assets/products/irish-potatoes.jpg",
    syncStatus: "SYNCED",
    timestamp: "2026-05-19T09:30:00Z",
  },
  {
    id: "L-603",
    farmerId: "F-102",
    cropName: "Avocados",
    quantityKg: 1200,
    pricePerKgKes: 70,
    harvestDate: "2026-05-20",
    grade: ProduceGrade.GRADE_A,
    moistureContentPct: 74,
    description: "Export-grade Hass avocados. Large sizing, green skin, firm structure.",
    spoilageRiskPct: 5,
    imageUrl: "/assets/products/hass-avocado.jpg",
    syncStatus: "SYNCED",
    timestamp: "2026-05-20T14:15:00Z",
  },
  {
    id: "L-604",
    farmerId: "F-101",
    cropName: "Sweet Potatoes",
    quantityKg: 1800,
    pricePerKgKes: 45,
    harvestDate: "2026-05-21",
    grade: ProduceGrade.GRADE_A,
    moistureContentPct: 65,
    description: "Orange-fleshed sweet potatoes from Uasin Gishu. High in Vitamin A, washed and sorted.",
    spoilageRiskPct: 8,
    imageUrl: "/assets/products/irish-potatoes.jpg",
    syncStatus: "SYNCED",
    timestamp: "2026-05-21T08:00:00Z",
  },
  {
    id: "L-605",
    farmerId: "F-104",
    cropName: "Oranges",
    quantityKg: 3200,
    pricePerKgKes: 55,
    harvestDate: "2026-05-22",
    grade: ProduceGrade.GRADE_A,
    moistureContentPct: 86,
    description: "Fresh juicy oranges harvested from Makueni orchards. Grade A citrus for retail and juice extraction.",
    spoilageRiskPct: 6,
    imageUrl: "/assets/products/generic-produce.jpg",
    syncStatus: "SYNCED",
    timestamp: "2026-05-22T10:30:00Z",
  },
  {
    id: "L-606",
    farmerId: "F-104",
    cropName: "Lemons",
    quantityKg: 800,
    pricePerKgKes: 80,
    harvestDate: "2026-05-23",
    grade: ProduceGrade.GRADE_B,
    moistureContentPct: 89,
    description: "Zesty Eureka lemons from Wote. Ideal for culinary use and beverage production.",
    spoilageRiskPct: 7,
    imageUrl: "/assets/products/generic-produce.jpg",
    syncStatus: "SYNCED",
    timestamp: "2026-05-23T11:00:00Z",
  }
];

// Initial Active Orders
export const SEED_ORDERS: Order[] = [
  {
    id: "O-701",
    buyerId: "B-201",
    listingIds: ["L-602"],
    totalQuantityKg: 4500,
    totalCostKes: 135000,
    paymentMethod: PaymentMethod.M_PESA,
    paymentStatus: PaymentStatus.COMPLETED,
    mpesaReceipt: "QRE7901LKF8",
    status: CargoStatus.IN_WAREHOUSE,
    deliveryAddress: "Nairobi Distribution Hub, Industrial Area Gate 4, Nairobi",
    createdAt: "2026-05-20T16:00:00Z",
  }
];

// Smart Truck Load Optimizer
// Recommends how to pack produce based on truck volume and payload capacity constraints
export function calculateOptimalLoad(
  listings: ProduceListing[],
  truckCapacityKg: number,
  needsCooling: boolean
) {
  let sorted = [...listings].sort((a, b) => {
    // Priority 1: High spoilage risk goes first
    if (needsCooling && a.spoilageRiskPct !== b.spoilageRiskPct) {
      return b.spoilageRiskPct - a.spoilageRiskPct;
    }
    // Priority 2: Higher price density per Kg
    return b.pricePerKgKes - a.pricePerKgKes;
  });

  const selectedListings: ProduceListing[] = [];
  let currentWeight = 0;

  for (const listing of sorted) {
    if (currentWeight + listing.quantityKg <= truckCapacityKg) {
      selectedListings.push(listing);
      currentWeight += listing.quantityKg;
    } else {
      // Partial split listing support
      const partialWeight = truckCapacityKg - currentWeight;
      if (partialWeight > 50) {
        selectedListings.push({
          ...listing,
          id: listing.id + "-PARTIAL",
          quantityKg: partialWeight,
          description: `Split batch: ${partialWeight}Kg optimized allocation.`,
        });
        currentWeight += partialWeight;
      }
      break;
    }
  }

  const volumeUtilizationPct = Math.round((currentWeight / truckCapacityKg) * 100);

  return {
    selectedListings,
    totalWeightKg: currentWeight,
    volumeUtilizationPct,
    optimalStackingInstruction: needsCooling 
      ? "Place Hass Avocados near reefer vents. Ensure potato crates have 3cm bottom spacing for air drainage."
      : "Secure heavier grain bags flat as bottom substrate. Stack potato mesh in tiered vertical columns.",
  };
}

// Interactive multi-stop route generator
export function constructDeliveryTrip(
  orderId: string,
  driverId: string,
  vehicleId: string,
  waypoints: { name: string; lat: number; lng: number; role: "COLLECTION" | "WAREHOUSE" | "BUYER" }[]
): DeliveryTrip {
  // Simple straight line simulation routes between waypoints
  const routePoints: [number, number][] = [];
  
  for (let i = 0; i < waypoints.length - 1; i++) {
    const start = waypoints[i];
    const end = waypoints[i+1];
    
    // Generate 15 interpolated steps for visualization smooth GPS ticks
    for (let step = 0; step < 15; step++) {
      const t = step / 15;
      const lat = start.lat + (end.lat - start.lat) * t;
      const lng = start.lng + (end.lng - start.lng) * t;
      routePoints.push([lat, lng]);
    }
  }
  
  // Add final waypoint
  const lastS = waypoints[waypoints.length - 1];
  routePoints.push([lastS.lat, lastS.lng]);

  const totalPoints = routePoints.length;
  const etaMinutes = totalPoints * 4; // 4 minutes per step
  
  return {
    id: "TRIP-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
    orderId,
    driverId,
    vehicleId,
    routeCoordinates: routePoints,
    currentLocationIndex: 0,
    waypoints: waypoints.map(w => ({ ...w, completed: false })),
    startLat: waypoints[0].lat,
    startLng: waypoints[0].lng,
    endLat: lastS.lat,
    endLng: lastS.lng,
    etaMinutes,
    fuelConsumedLiters: 0,
    status: "ASSIGNED",
  };
}
