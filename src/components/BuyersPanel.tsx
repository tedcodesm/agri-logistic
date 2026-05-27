import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Search, 
  MapPin, 
  Coins, 
  ShoppingBag, 
  Trash2, 
  CreditCard,
  CheckCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Info,
  Sprout,
  Filter,
  Sparkles,
  TrendingUp,
  BrainCircuit,
  Truck,
  Activity,
  Warehouse
} from "lucide-react";
import { Buyer, ProduceListing, Order, PaymentMethod, PaymentStatus, CargoStatus } from "../types";

interface BuyersPanelProps {
  buyers: Buyer[];
  listings: ProduceListing[];
  orders: Order[];
  onPlaceOrder: (order: Order) => void;
  /** When true, hides account switcher (dashboard marketplace). */
  embedded?: boolean;
  /** Lock checkout to this buyer id (logged-in user). */
  initialBuyerId?: string;
}

export default function BuyersPanel({
  buyers,
  listings,
  orders,
  onPlaceOrder,
  embedded = false,
  initialBuyerId,
}: BuyersPanelProps) {
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>(initialBuyerId ?? "B-201");
  const [searchCrop, setSearchCrop] = useState<string>("");
  const [filterCounty, setFilterCounty] = useState<string>("All");
  
  // Cart state
  const [cart, setCart] = useState<ProduceListing[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.M_PESA);
  const [phoneNumber, setPhoneNumber] = useState<string>("0711223344");

  // MPESA STK Simulator status
  const [checkoutState, setCheckoutState] = useState<"IDLE" | "PENDING" | "PROMPTED" | "SUCCESS" | "FAILED">("IDLE");
  const [mpesaDetails, setMpesaDetails] = useState<any>(null);
  const [mpesaPin, setMpesaPin] = useState<string>("");
  const [receiptNumber, setReceiptNumber] = useState<string>("");

  const currentBuyer = buyers.find(b => b.id === selectedBuyerId) || buyers[0];

  // Filtering listings
  const filteredListings = listings.filter(item => {
    const matchesCrop = item.cropName.toLowerCase().includes(searchCrop.toLowerCase());
    const matchesCounty = filterCounty === "All" || (item.id === "L-601" && filterCounty === "Uasin Gishu") || (item.id === "L-602" && filterCounty === "Nyandarua") || (item.id === "L-603" && filterCounty === "Meru");
    return matchesCrop && matchesCounty;
  });

  function addToCart(item: ProduceListing) {
    if (cart.some(c => c.id === item.id)) return;
    setCart([...cart, item]);
  }

  function removeFromCart(id: string) {
    setCart(cart.filter(item => item.id !== id));
  }

  const totalKg = cart.reduce((acc, c) => acc + c.quantityKg, 0);
  const totalCost = cart.reduce((acc, c) => acc + (c.quantityKg * c.pricePerKgKes), 0);

  // Trigger PesaPal Secure Checkout Gateway
  const [pesapalIframeUrl, setPesapalIframeUrl] = useState<string>("");

  useEffect(() => {
    if (initialBuyerId) setSelectedBuyerId(initialBuyerId);
  }, [initialBuyerId]);

  async function handlePesapalCheckout() {
    setCheckoutState("PENDING");

    const orderId = "O-" + Math.round(Math.random() * 90000 + 10000);

    try {
      const res = await fetch("/api/pesapal/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountKes: totalCost,
          orderId,
          email: `${currentBuyer.id.toLowerCase()}@agrilogistics.ke`,
          phone: "0711000000",
          name: currentBuyer.name
        })
      });
      const data = await res.json();
      if (data.redirectUrl) {
        setPesapalIframeUrl(data.redirectUrl);
        setCheckoutState("PROMPTED");
        
        const handleMessage = (event: MessageEvent) => {
          if (event.data && event.data.type === 'PESAPAL_PAYMENT_SUCCESS') {
            window.removeEventListener('message', handleMessage);
            setPesapalIframeUrl("");
            
            const virtualReceipt = "PES" + Math.round(Math.random() * 800 + 100) + "X" + Math.random().toString(36).substr(2, 4).toUpperCase();
            setReceiptNumber(virtualReceipt);
            setCheckoutState("SUCCESS");

            const newOrder: Order = {
              id: orderId,
              buyerId: selectedBuyerId,
              listingIds: cart.map(c => c.id),
              totalQuantityKg: totalKg,
              totalCostKes: totalCost,
              paymentMethod: PaymentMethod.PESAPAL,
              paymentStatus: PaymentStatus.COMPLETED,
              mpesaReceipt: virtualReceipt,
              status: CargoStatus.READY_FOR_COLLECTION,
              deliveryAddress: `${currentBuyer.companyName} Delivery Depot, Industrial Zone, ${currentBuyer.location.city}`,
              createdAt: new Date().toISOString()
            };

            onPlaceOrder(newOrder);
            setCart([]);
          }
        };
        window.addEventListener('message', handleMessage);
      } else {
        setCheckoutState("FAILED");
      }
    } catch (e) {
      console.error("PesaPal setup failed:", e);
      setCheckoutState("FAILED");
    }
  }

  // Trigger MPESA via Express API
  async function handleMpesaCheckout() {
    if (!phoneNumber) {
      alert("Please specify a phone number.");
      return;
    }
    setCheckoutState("PENDING");

    try {
      const res = await fetch("/api/mpesa-simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber,
          amountKes: totalCost,
          orderId: "O-" + Math.round(Math.random() * 90000 + 10000)
        })
      });
      const data = await res.json();
      setMpesaDetails(data);
      setCheckoutState("PROMPTED");
    } catch (e) {
      console.error(e);
      setCheckoutState("FAILED");
    }
  }

  function simulateSuccessCallback() {
    const virtualReceipt = "MPE" + Math.round(Math.random() * 800 + 100) + "S" + Math.random().toString(36).substr(2, 4).toUpperCase();
    setReceiptNumber(virtualReceipt);
    setCheckoutState("SUCCESS");

    const newOrder: Order = {
      id: "O-" + Math.round(Math.random() * 9000 + 1000),
      buyerId: selectedBuyerId,
      listingIds: cart.map(c => c.id),
      totalQuantityKg: totalKg,
      totalCostKes: totalCost,
      paymentMethod,
      paymentStatus: PaymentStatus.COMPLETED,
      mpesaReceipt: virtualReceipt,
      status: CargoStatus.READY_FOR_COLLECTION,
      deliveryAddress: `${currentBuyer.companyName} Delivery Depot, Industrial Zone, ${currentBuyer.location.city}`,
      createdAt: new Date().toISOString()
    };

    onPlaceOrder(newOrder);
    setCart([]);
  }

  function handleGenericCheckout() {
    const newOrder: Order = {
      id: "O-" + Math.round(Math.random() * 9000 + 1000),
      buyerId: selectedBuyerId,
      listingIds: cart.map(c => c.id),
      totalQuantityKg: totalKg,
      totalCostKes: totalCost,
      paymentMethod,
      paymentStatus: PaymentStatus.PENDING,
      status: CargoStatus.READY_FOR_COLLECTION,
      deliveryAddress: `${currentBuyer.companyName} Dispatch Gate, ${currentBuyer.location.city}`,
      createdAt: new Date().toISOString()
    };
    onPlaceOrder(newOrder);
    setCart([]);
    setCheckoutState("SUCCESS");
  }

  return (
    <div id="buyers-container" className="flex flex-col gap-6 font-sans">
      
      {/* Top Header - Buyer Profile */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-agri-navy to-slate-800 flex items-center justify-center text-white font-bold text-lg shadow-inner">
            {currentBuyer.companyName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-display font-bold text-slate-900 leading-tight">
                {currentBuyer.companyName}
              </h3>
              <span className="flex items-center gap-1 text-[10px] font-bold text-agri-emerald-dark bg-agri-emerald/10 border border-agri-emerald/20 px-2 py-0.5 rounded-md uppercase tracking-wide">
                <ShieldCheck className="w-3 h-3" /> Verified Buyer
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <MapPin className="w-3 h-3" /> {currentBuyer.location.city} • Contact: {currentBuyer.name}
            </p>
          </div>
        </div>

        {!embedded && (
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-400 uppercase ml-2 mr-1">Switch Account:</span>
          {buyers.map(b => (
            <button
              key={b.id}
              onClick={() => {
                setSelectedBuyerId(b.id);
                setCart([]);
                setCheckoutState("IDLE");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedBuyerId === b.id 
                  ? "bg-white text-agri-navy shadow-sm border border-slate-200" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-transparent"
              }`}
            >
              {b.companyName.split(" ")[0]}
            </button>
          ))}
        </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Filters & AI Intel (3 cols) */}
        <div className="xl:col-span-3 flex flex-col gap-6">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
            <h4 className="font-display font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Filter className="w-4 h-4 text-slate-400" /> Market Search
            </h4>
            
            <div className="relative group">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-agri-emerald transition-colors" />
              <input
                type="text"
                placeholder="Search crops, grades..."
                value={searchCrop}
                onChange={(e) => setSearchCrop(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-agri-emerald focus:bg-white focus:ring-4 focus:ring-agri-emerald/10 transition-all font-medium"
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">County</label>
              <select
                value={filterCounty}
                onChange={(e) => setFilterCounty(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium outline-none text-slate-700 focus:border-agri-emerald focus:bg-white focus:ring-4 focus:ring-agri-emerald/10 transition-all cursor-pointer"
              >
                <option value="All">All Regions</option>
                <option value="Uasin Gishu">Uasin Gishu</option>
                <option value="Nyandarua">Nyandarua</option>
                <option value="Meru">Meru</option>
              </select>
            </div>
          </div>

          <div className="bg-gradient-to-br from-agri-navy to-agri-navy-light rounded-2xl p-6 border border-slate-800 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-agri-emerald/10 rounded-full blur-2xl group-hover:bg-agri-emerald/20 transition-all duration-700"></div>
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-agri-cyan/10 rounded-full blur-2xl group-hover:bg-agri-cyan/20 transition-all duration-700"></div>
            
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <div className="w-2 h-2 rounded-full bg-agri-cyan animate-pulse"></div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4 text-agri-cyan" /> Mkulima Intel AI
              </h4>
            </div>
            <div className="space-y-4 relative z-10">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="text-[10px] text-agri-amber font-mono mb-1 uppercase">Market Alert</div>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  High maize demand in Nairobi (+12%). Expected supply constraints next week.
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="text-[10px] text-agri-cyan font-mono mb-1 uppercase">Logistics Optimization</div>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  Consolidated transport available from Nyandarua to Nairobi. -15% freight cost.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* CENTER COLUMN: Marketplace Listings (6 cols) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900">Live Supply Chain</h2>
              <p className="text-sm text-slate-500 mt-1">Verified agricultural produce ready for procurement</p>
            </div>
            <div className="hidden sm:flex gap-2">
              <div className="text-xs font-medium text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-agri-emerald" /> {filteredListings.length} Active Batches
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {filteredListings.length === 0 ? (
              <div className="sm:col-span-2 bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                <Search className="w-8 h-8 text-slate-300 mb-3" />
                <h4 className="text-slate-700 font-bold">No crops found</h4>
                <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or search query.</p>
              </div>
            ) : (
              filteredListings.map(item => {
                const locationMap: Record<string, string> = {
                  "L-601": "Uasin Gishu",
                  "L-602": "Nyandarua",
                  "L-603": "Meru"
                };
                const locationCounty = locationMap[item.id] || "Kenya";
                const inCart = cart.some(c => c.id === item.id);
                const isGradeA = item.grade === "A";
                
                return (
                  <motion.div 
                    key={item.id} 
                    whileHover={{ y: -4 }}
                    className={`group bg-white rounded-2xl border transition-all duration-300 flex flex-col relative overflow-hidden ${inCart ? 'border-agri-emerald shadow-lg ring-1 ring-agri-emerald/20' : 'border-slate-200 shadow-sm hover:shadow-xl'}`}
                  >
                    {item.imageUrl && (
                      <div className="h-44 w-full relative overflow-hidden bg-slate-100">
                        <img src={item.imageUrl} alt={item.cropName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-agri-navy/80 via-transparent to-transparent"></div>
                        <div className="absolute top-3 right-3">
                           <span className="text-[10px] text-white/90 font-bold backdrop-blur-md bg-black/40 px-2 py-1 rounded-full flex items-center gap-1 border border-white/10">
                              <ShieldCheck className="w-3 h-3 text-agri-emerald" /> Verified
                           </span>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                          <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md shadow-sm backdrop-blur-md ${isGradeA ? 'bg-amber-400/90 text-amber-950' : 'bg-white/90 text-slate-800'}`}>
                            Grade {item.grade}
                          </span>
                          <span className="text-[10px] text-white/90 flex items-center gap-1 font-semibold backdrop-blur-sm bg-white/20 px-2.5 py-1 rounded-full border border-white/10">
                            <MapPin className="w-3 h-3" /> {locationCounty}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="p-5 pb-4 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-display font-bold text-slate-900 text-lg leading-none mb-1.5">{item.cropName}</h4>
                          <div className="text-[10px] text-slate-500 font-medium">
                            Farmer: KYC Verified • Harvest: {new Date(item.harvestDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4 mt-auto">
                        <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Moisture</div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                              <div className={`h-full rounded-full ${item.moistureContentPct <= 13.5 ? 'bg-agri-emerald' : 'bg-amber-500'}`} style={{ width: `${Math.min(item.moistureContentPct * 5, 100)}%` }}></div>
                            </div>
                            <span className="text-xs font-bold text-slate-700">{item.moistureContentPct}%</span>
                          </div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Spoilage Risk</div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                              <div className={`h-full rounded-full ${item.spoilageRiskPct > 15 ? 'bg-red-500' : 'bg-agri-cyan'}`} style={{ width: `${item.spoilageRiskPct}%` }}></div>
                            </div>
                            <span className="text-xs font-bold text-slate-700">{item.spoilageRiskPct}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 bg-blue-50/50 p-2 rounded-lg border border-blue-100/50">
                         <Truck className="w-4 h-4 text-blue-500" /> Transporter availability: High
                      </div>

                      <div className="flex justify-between items-end mt-auto pt-4 border-t border-slate-100">
                        <div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Price / Kg</div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xs font-bold text-slate-400">KES</span>
                            <strong className="text-xl font-display font-bold text-slate-900 tracking-tight">{item.pricePerKgKes.toLocaleString()}</strong>
                          </div>
                        </div>
                        <button
                          onClick={() => addToCart(item)}
                          disabled={inCart}
                          className={`relative px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
                            inCart
                              ? "bg-agri-emerald/10 text-agri-emerald border border-agri-emerald/20 cursor-not-allowed"
                              : "bg-agri-navy hover:bg-slate-800 text-white hover:shadow-lg hover:-translate-y-0.5"
                          }`}
                        >
                          {inCart ? "Added" : "Procure"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Cart & Escrow (3 cols) */}
        <div className="xl:col-span-3 flex flex-col gap-6">
          
          {/* Shopping Cart Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 sticky top-[90px]">
            <h4 className="font-display font-bold text-slate-900 flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-agri-emerald" /> Escrow Cart
              </span>
              {cart.length > 0 && <span className="text-xs bg-agri-emerald/10 text-agri-emerald font-bold px-2.5 py-0.5 rounded-full">{cart.length} items</span>}
            </h4>

            {cart.length === 0 ? (
              <div className="text-center py-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                  <ShoppingBag className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-slate-500 text-sm">Your escrow cart is empty. Select listed batches to begin.</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-200 bg-slate-50 group">
                      <div className="flex-1">
                        <h5 className="font-bold text-slate-900 text-sm">{item.cropName}</h5>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-slate-500 text-xs font-medium">{item.quantityKg.toLocaleString()} Kg</span>
                          <span className="text-slate-300 text-[10px]">•</span>
                          <span className="text-slate-500 text-xs font-medium">KES {item.pricePerKgKes}/Kg</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <strong className="text-slate-900 font-mono text-sm">{(item.quantityKg * item.pricePerKgKes).toLocaleString()}</strong>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-red-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Total Quantity</span>
                    <strong className="text-slate-900">{totalKg.toLocaleString()} Kg</strong>
                  </div>
                  <div className="flex justify-between items-end pt-2">
                    <span className="text-slate-600 font-bold">Total Escrow</span>
                    <strong className="text-agri-emerald text-2xl font-mono tracking-tight leading-none">KES {totalCost.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="mt-2 pt-4 border-t border-slate-100">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Funding Source</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod(PaymentMethod.M_PESA)}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        paymentMethod === PaymentMethod.M_PESA
                          ? "bg-agri-emerald/5 border-agri-emerald text-agri-emerald-dark shadow-sm"
                          : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      <Coins className="w-5 h-5" />
                      <span className="text-xs font-bold">M-PESA</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod(PaymentMethod.PESAPAL)}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        paymentMethod === PaymentMethod.PESAPAL
                          ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm"
                          : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                      <span className="text-xs font-bold">PesaPal</span>
                    </button>
                  </div>

                  {paymentMethod === PaymentMethod.M_PESA && (
                    <div className="mt-4">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Safaricom Number</label>
                      <input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-sm font-mono font-medium outline-none focus:border-agri-emerald focus:ring-2 focus:ring-agri-emerald/20 transition-all"
                      />
                    </div>
                  )}

                  <button
                    onClick={paymentMethod === PaymentMethod.M_PESA ? handleMpesaCheckout : handlePesapalCheckout}
                    className="mt-6 w-full bg-agri-emerald hover:bg-agri-emerald-dark text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-5 h-5" /> Lock Funds in Escrow
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Checkout Simulator Modal/Overlay */}
          {checkoutState !== "IDLE" && (
            <div className="bg-agri-navy border border-slate-800 rounded-2xl p-5 text-white shadow-2xl flex flex-col gap-4 animate-in slide-in-from-bottom-4 duration-300">
               <div className="flex justify-between items-center mb-2">
                 <div className="flex items-center gap-2">
                   <div className="w-2.5 h-2.5 rounded-full bg-agri-emerald animate-pulse"></div>
                   <div className="font-bold text-sm">Transaction Simulator</div>
                 </div>
                 <div className="text-[10px] uppercase font-bold text-agri-cyan border border-agri-cyan/30 px-2 py-0.5 rounded bg-agri-cyan/10">Sandbox</div>
               </div>
               
               {checkoutState === "PENDING" && <div className="text-sm text-slate-400 animate-pulse text-center py-4">Initializing Secure Gateway...</div>}
               {checkoutState === "SUCCESS" && (
                 <div className="text-center py-6">
                    <CheckCircle className="w-12 h-12 text-agri-emerald mx-auto mb-3" />
                    <div className="font-bold text-lg mb-1">Escrow Secured</div>
                    <div className="text-xs text-slate-400">Receipt: <span className="text-agri-emerald font-mono">{receiptNumber}</span></div>
                 </div>
               )}
               {checkoutState === "PROMPTED" && mpesaDetails && (
                 <div className="space-y-4">
                    <div className="bg-slate-800 p-3 rounded-lg text-xs font-mono">
                      <div>Amount: KES {totalCost}</div>
                      <div>Target: {phoneNumber}</div>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="password" 
                        maxLength={4} 
                        placeholder="PIN" 
                        value={mpesaPin} 
                        onChange={e => setMpesaPin(e.target.value)} 
                        className="bg-slate-900 border border-slate-700 rounded-lg p-2 w-20 text-center focus:border-agri-emerald outline-none" 
                      />
                      <button 
                        onClick={simulateSuccessCallback} 
                        className="flex-1 bg-agri-emerald text-agri-navy font-bold rounded-lg hover:bg-agri-emerald-dark"
                      >
                        Approve
                      </button>
                    </div>
                 </div>
               )}
            </div>
          )}

          {/* Active Fleet / Logistics Widget */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
             <h4 className="font-display font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
               <Truck className="w-5 h-5 text-blue-500" /> Logistics Activity
             </h4>
             <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                   <div className="flex gap-3 items-center">
                     <div className="w-8 h-8 rounded-full bg-blue-200/50 flex items-center justify-center"><Truck className="w-4 h-4 text-blue-700"/></div>
                     <div>
                       <div className="text-xs font-bold text-slate-900">Truck KCD-200X</div>
                       <div className="text-[10px] text-slate-500">Nyandarua → Nairobi</div>
                     </div>
                   </div>
                   <div className="text-right">
                     <div className="text-xs font-bold text-blue-700">En route</div>
                     <div className="text-[10px] text-slate-500">ETA: 4 hrs</div>
                   </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                   <div className="flex gap-3 items-center">
                     <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center"><Warehouse className="w-4 h-4 text-slate-600"/></div>
                     <div>
                       <div className="text-xs font-bold text-slate-900">Meru Hub</div>
                       <div className="text-[10px] text-slate-500">Capacity: 85%</div>
                     </div>
                   </div>
                   <div className="text-right">
                     <div className="text-xs font-bold text-slate-700">Accepting</div>
                     <div className="text-[10px] text-agri-emerald">Optimal Temp</div>
                   </div>
                </div>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}
