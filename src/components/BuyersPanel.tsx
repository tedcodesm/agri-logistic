import React, { useState } from "react";
import { 
  Search, 
  MapPin, 
  Coins, 
  ShoppingBag, 
  Trash2, 
  CreditCard,
  CreditCard as MpesaIcon,
  CheckCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Info
} from "lucide-react";
import { Buyer, ProduceListing, Order, PaymentMethod, PaymentStatus, CargoStatus } from "../types";

interface BuyersPanelProps {
  buyers: Buyer[];
  listings: ProduceListing[];
  orders: Order[];
  onPlaceOrder: (order: Order) => void;
}

export default function BuyersPanel({ buyers, listings, orders, onPlaceOrder }: BuyersPanelProps) {
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>("B-201");
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
  const [pesapalIframeUrl, setPesapalIframeUrl] = useState<string>(" ");

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
        
        // Listen to secure postMessage callback from the new checkout page
        const handleMessage = (event: MessageEvent) => {
          if (event.data && event.data.type === 'PESAPAL_PAYMENT_SUCCESS') {
            window.removeEventListener('message', handleMessage);
            setPesapalIframeUrl("");
            
            // finalise order creation!
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

  // Simulate Safaricom STK Push success callback
  function simulateSuccessCallback() {
    const virtualReceipt = "MPE" + Math.round(Math.random() * 800 + 100) + "S" + Math.random().toString(36).substr(2, 4).toUpperCase();
    setReceiptNumber(virtualReceipt);
    setCheckoutState("SUCCESS");

    // final order submission
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
    <div id="buyers-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
      
      {/* Buyers profile bar and marketplace filter */}
      <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <span className="text-xs font-semibold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Wholesale Market Portal
            </span>
            <h3 className="text-lg font-bold text-slate-800 mt-2 flex items-center gap-2">
              {currentBuyer.companyName}
              <span className="text-xs font-normal text-slate-400">({currentBuyer.name})</span>
            </h3>
            <p className="text-xs text-slate-500">
              🏢 Main Depot: {currentBuyer.location.city} | Verification Status: 
              <span className="text-emerald-600 font-semibold ml-1">✓ {currentBuyer.kycStatus}</span>
            </p>
          </div>

          {/* Quick Select Buyer */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Log In Buyer ID:</span>
            {buyers.map(b => (
              <button
                key={b.id}
                onClick={() => {
                  setSelectedBuyerId(b.id);
                  setCart([]);
                  setCheckoutState("IDLE");
                }}
                className={`px-3 py-1.5 rounded-lg border font-medium cursor-pointer ${
                  selectedBuyerId === b.id 
                    ? "bg-slate-800 text-white border-slate-800" 
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {b.companyName.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* LEFT COLUMN: Browse Market listings */}
      <div className="lg:col-span-7 flex flex-col gap-5">
        
        {/* Market Filter Header */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              id="search-crop-input"
              type="text"
              placeholder="Search crop variety (e.g., Maize, Potatoes...)"
              value={searchCrop}
              onChange={(e) => setSearchCrop(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-sky-500"
            />
          </div>

          <select
            id="filter-county-select"
            value={filterCounty}
            onChange={(e) => setFilterCounty(e.target.value)}
            className="rounded-lg border border-slate-200 p-2 text-sm outline-none bg-white text-slate-700 focus:border-sky-500"
          >
            <option value="All">All Counties</option>
            <option value="Uasin Gishu">Uasin Gishu</option>
            <option value="Nyandarua">Nyandarua</option>
            <option value="Meru">Meru</option>
          </select>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredListings.length === 0 ? (
            <div className="bg-slate-50 border border-dashed rounded-xl p-8 text-center col-span-2 text-slate-400 text-sm">
              No matching agricultural crops listed in this county.
            </div>
          ) : (
            filteredListings.map(item => {
              // Extract dummy farmer names
              const locationCounty = item.id === "L-601" ? "Uasin Gishu" : item.id === "L-602" ? "Nyandarua" : "Meru";
              return (
                <div key={item.id} className="bg-white rounded-2xl border border-slate-100 hover:border-sky-200 p-5 shadow-sm transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-800 text-base">{item.cropName}</h4>
                      <span className="text-[10px] uppercase font-bold bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full border border-sky-100">
                        Grade {item.grade}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-300" />
                      {locationCounty} County
                    </p>

                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 italic">
                      "{item.description}"
                    </p>

                    {/* Quality factors metrics */}
                    <div className="mt-3 grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-lg text-[10px] text-slate-500">
                      <div>
                        Moisture: <strong className="text-slate-700">{item.moistureContentPct}%</strong>
                      </div>
                      <div>
                        Spoilage Risk: <strong className="text-slate-700">{item.spoilageRiskPct}%</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-50 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-tight block">Target Price</span>
                      <strong className="text-slate-800 text-base">KES {item.pricePerKgKes} <span className="text-xs font-normal text-slate-500">/Kg</span></strong>
                      <span className="text-[10px] block text-sky-600 font-semibold mt-0.5">Vol: {item.quantityKg} Kg</span>
                    </div>

                    <button
                      id={`add-cart-btn-${item.id}`}
                      onClick={() => addToCart(item)}
                      disabled={cart.some(c => c.id === item.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                        cart.some(c => c.id === item.id)
                          ? "bg-slate-100 text-slate-400"
                          : "bg-sky-500 hover:bg-sky-600 text-white shadow-sm"
                      }`}
                    >
                      {cart.some(c => c.id === item.id) ? "In Cart" : "Buy Bulk Batch"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Cart and M-PESA invoice */}
      <div className="lg:col-span-5 flex flex-col gap-5">
        
        {/* Shopping Cart Card */}
        <div id="cart-card" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 tracking-tight uppercase flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
            <ShoppingBag className="w-4 h-4 text-sky-500" />
            Consolidated Produce Cart
          </h4>

          {cart.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Your procure cart is empty. Select listed batches to place supply orders.
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-150 text-xs">
                  <div>
                    <h5 className="font-bold text-slate-800">{item.cropName} (Grade {item.grade})</h5>
                    <p className="text-slate-500 text-[10px] mt-0.5">{item.quantityKg} Kg @ KES {item.pricePerKgKes}/Kg</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <strong className="text-slate-800 font-mono">KES {(item.quantityKg * item.pricePerKgKes).toLocaleString()}</strong>
                    <button
                      id={`remove-cart-${item.id}`}
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-400 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Math summaries */}
              <div className="pt-4 mt-2 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Quantity:</span>
                  <strong className="text-slate-800">{totalKg.toLocaleString()} Kg</strong>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <span className="text-slate-600 font-semibold">Total Order Cost:</span>
                  <strong className="text-slate-900 text-lg font-mono">KES {totalCost.toLocaleString()}</strong>
                </div>
              </div>

              {/* Payment Selectors */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Billing Method</label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  <button
                    id="mpesa-btn"
                    type="button"
                    onClick={() => setPaymentMethod(PaymentMethod.M_PESA)}
                    className={`flex items-center justify-center gap-1 px-2 py-2 rounded-lg border font-medium cursor-pointer transition-all ${
                      paymentMethod === PaymentMethod.M_PESA
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                        : "bg-white text-slate-600 border-slate-200"
                    }`}
                  >
                    <Coins className="w-3.5 h-3.5" />
                    M-PESA
                  </button>
                  <button
                    id="pesapal-btn"
                    type="button"
                    onClick={() => setPaymentMethod(PaymentMethod.PESAPAL)}
                    className={`flex items-center justify-center gap-1 px-2 py-2 rounded-lg border font-medium cursor-pointer transition-all ${
                      paymentMethod === PaymentMethod.PESAPAL
                        ? "bg-amber-50 text-amber-700 border-amber-300"
                        : "bg-white text-slate-600 border-slate-200"
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    PesaPal
                  </button>
                  <button
                    id="cod-btn"
                    type="button"
                    onClick={() => setPaymentMethod(PaymentMethod.CASH_ON_DELIVERY)}
                    className={`flex items-center justify-center gap-1 px-2 py-2 rounded-lg border font-medium cursor-pointer transition-all ${
                      paymentMethod === PaymentMethod.CASH_ON_DELIVERY
                        ? "bg-slate-50 text-slate-800 border-slate-300 font-semibold"
                        : "bg-white text-slate-600 border-slate-200"
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    COD
                  </button>
                </div>

                {paymentMethod === PaymentMethod.M_PESA && (
                  <div className="mt-3">
                    <label className="block text-[9.5px] font-bold text-slate-500 uppercase">M-PESA Phone (+254)</label>
                    <input
                      id="phone-mpesa-val"
                      type="text"
                      placeholder="e.g. 0711223344"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-slate-200 p-2 text-xs font-mono"
                    />
                  </div>
                )}

                <button
                  id="checkout-btn"
                  onClick={
                    paymentMethod === PaymentMethod.M_PESA 
                      ? handleMpesaCheckout 
                      : paymentMethod === PaymentMethod.PESAPAL
                        ? handlePesapalCheckout
                        : handleGenericCheckout
                  }
                  className="mt-4 w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2.5 rounded-xl text-xs transition-all tracking-wide select-none cursor-pointer"
                >
                  {paymentMethod === PaymentMethod.M_PESA 
                    ? "Trigger M-PESA STK Push Invoice" 
                    : paymentMethod === PaymentMethod.PESAPAL
                      ? "Initiate Secure PesaPal Checkout"
                      : "Fulfill Cash Order"
                  }
                </button>

              </div>
            </div>
          )}
        </div>

        {/* MPESA Dynamic STK Simulator Visual Frame */}
        {checkoutState !== "IDLE" && (
          <div id="mpesa-simulation-frame" className="bg-slate-900 border border-slate-850 rounded-2xl p-5 text-white shadow-xl flex flex-col gap-4 animate-fadeIn">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse" />
                <h5 className="font-bold text-xs text-slate-100 uppercase tracking-wide">M-PESA Checkout Sandbox</h5>
              </div>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-mono px-2 py-0.5 rounded">Daraja v2.0 API</span>
            </div>

            {checkoutState === "PENDING" && (
              <p className="text-xs text-slate-400 animate-pulse">
                {paymentMethod === PaymentMethod.PESAPAL 
                  ? "Configuring secure token and invoking PesaPal gateway..." 
                  : "Contacting Safaricom API Gateway on Port 3000..."
                }
              </p>
            )}

            {paymentMethod === PaymentMethod.PESAPAL && checkoutState === "PROMPTED" && pesapalIframeUrl && (
              <div className="space-y-4">
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/25 flex items-start gap-2.5 text-xs">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" />
                  <div>
                    <span className="font-bold text-amber-400">Secure PesaPal Gateway Redirect Active</span>
                    <p className="mt-0.5 text-slate-300 leading-normal">PesaPal secures transactions using central bank authorized sandbox clearances. Ensure you approve Safaricom M-Pesa pin prompts on launch.</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      window.open(pesapalIframeUrl, "PesaPalSecureCheckout", "width=520,height=700,status=yes,scrollbars=yes");
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/15"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-950" />
                    Launch Secure PesaPal Checkout Page
                  </button>

                  <p className="text-[10px] text-slate-400 text-center animate-pulse">
                    ⏳ Listening dynamically on local server webhook callback for payment completion updates...
                  </p>
                </div>
              </div>
            )}


            {checkoutState === "PROMPTED" && mpesaDetails && (
              <div className="space-y-3">
                <p className="text-xs text-slate-300">
                  ⚡ STK Push request successfully received by server router. Callback token created.
                </p>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                  <div>Ref Checkout: <span className="text-amber-400">{mpesaDetails.checkoutRequestID}</span></div>
                  <div>Phone Target: <span className="text-slate-100">{phoneNumber}</span></div>
                  <div>Amount Bill: <span className="text-emerald-400">KES {totalCost.toLocaleString()}</span></div>
                </div>

                <div className="p-3 bg-slate-850/50 rounded-xl flex flex-col gap-2 border border-slate-800">
                  <label className="text-[10px] text-slate-400 uppercase">Input Virtual M-PESA PIN</label>
                  <div className="flex gap-2">
                    <input
                      id="mpesa-pin-val"
                      type="password"
                      maxLength={4}
                      placeholder="••••"
                      value={mpesaPin}
                      onChange={(e) => setMpesaPin(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded p-1.5 w-16 text-center text-sm font-bold tracking-widest text-white outline-none focus:border-emerald-500"
                    />
                    <button
                      id="callback-success-btn"
                      onClick={simulateSuccessCallback}
                      disabled={mpesaPin.length < 4}
                      className="flex-1 bg-emerald-500 disabled:bg-slate-700 text-white rounded font-semibold text-xs py-1.5 hover:bg-emerald-600 transition-all cursor-pointer"
                    >
                      Authenticate Pay Callback
                    </button>
                  </div>
                </div>
              </div>
            )}

            {checkoutState === "SUCCESS" && (
              <div className="space-y-2 text-center py-2 flex flex-col items-center">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
                <h6 className="text-sm font-bold text-white">Payment Verified successfully</h6>
                <p className="text-[11px] text-slate-400">
                  Daraja Transaction Receipt: <strong className="text-emerald-400 font-mono">{receiptNumber || "MPER8912A0"}</strong>
                </p>
                <p className="text-[10px] text-slate-500">
                  Fulfillment Ledger updated. The logistics coordinator will pack and route cargo to your designated depots.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Historic Orders */}
        <div id="buyer-orders-card" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <h4 className="text-xs font-bold text-slate-800 tracking-tight uppercase border-b border-slate-100 pb-2 mb-3">
            Your Supplier Invoices ({orders.length})
          </h4>

          <div className="space-y-3">
            {orders.map(o => (
              <div key={o.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 text-xs flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-1.5">
                    <strong className="text-slate-800">{o.id}</strong>
                    <span className="text-slate-400">•</span>
                    <span className="text-[10px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded font-bold">{o.status}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Qty: {o.totalQuantityKg.toLocaleString()} Kg • Total: KES {o.totalCostKes.toLocaleString()}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-1 truncate max-w-[180px]">
                    📍 {o.deliveryAddress}
                  </p>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase block ${
                    o.paymentStatus === PaymentStatus.COMPLETED 
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-150" 
                      : "bg-amber-50 text-amber-700 border border-amber-150 animate-pulse"
                  }`}>
                    {o.paymentStatus}
                  </span>
                  {o.mpesaReceipt && (
                    <span className="text-[9px] text-emerald-600 block font-mono mt-1">Receipt: {o.mpesaReceipt}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
