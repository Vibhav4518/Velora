import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, CreditCard, Ticket, CheckCircle, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { shippingApi } from '../api/shippingApi';
import { couponApi } from '../api/couponApi';
import { orderApi } from '../api/orderApi';
import { useToast } from '../context/ToastContext';

export const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const toast = useToast();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddress, setShowNewAddress] = useState(false);

  // Address Form State
  const [newAddr, setNewAddr] = useState({
    full_name: '',
    phone: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'United States',
    is_default: true,
  });

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [submitting, setSubmitting] = useState(false);

  const items = cart.items || [];
  const subtotal = Number(cart.subtotal) || 0;

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await shippingApi.getAddresses();
        const list = res.data.data || [];
        setAddresses(list);
        const def = list.find((a) => a.is_default) || list[0];
        if (def) setSelectedAddressId(def.id);
        else setShowNewAddress(true);
      } catch (err) {
        console.error('Failed to fetch addresses', err);
      }
    };
    fetchAddresses();
  }, []);

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await shippingApi.createAddress(newAddr);
      const created = res.data.data;
      setAddresses([...addresses, created]);
      setSelectedAddressId(created.id);
      setShowNewAddress(false);
      toast.success('Shipping address added!');
    } catch (err) {
      toast.error('Failed to add address');
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    try {
      const res = await couponApi.validateCoupon(couponCode.trim(), subtotal);
      setAppliedCoupon(res.data.data);
      toast.success('Coupon applied successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid coupon code';
      toast.error(msg);
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const discountAmount = appliedCoupon ? Number(appliedCoupon.discount_amount) || 0 : 0;
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const shippingFee = taxableSubtotal >= 100 || subtotal === 0 ? 0 : 10;
  const tax = taxableSubtotal * 0.08;
  const grandTotal = taxableSubtotal + shippingFee + tax;

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.warning('Please select or add a shipping address');
      return;
    }
    setSubmitting(true);
    try {
      const res = await orderApi.checkout({
        address_id: selectedAddressId,
        coupon_code: appliedCoupon ? appliedCoupon.code : '',
        payment_method: paymentMethod,
      });
      const orderNumber = res.data.data.order_number;
      await clearCart(true);
      navigate(`/orders/success/${orderNumber}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to place order';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
        <button onClick={() => navigate('/shop')} className="mt-4 px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm">
          Go to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <h1 className="font-serif text-3xl font-bold text-gray-900 pb-4 border-b border-gray-100">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Checkout Steps */}
        <div className="lg:col-span-2 space-y-8">
          {/* Step 1: Shipping Address */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">1</div>
                <h3 className="text-xl font-bold text-gray-900">Shipping Address</h3>
              </div>
              {!showNewAddress && (
                <button
                  onClick={() => setShowNewAddress(true)}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add New Address
                </button>
              )}
            </div>

            {/* Address Selection Grid */}
            {!showNewAddress && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedAddressId === addr.id
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-600/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-gray-900">{addr.full_name}</span>
                      {addr.is_default && <span className="text-[10px] font-bold bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full">Default</span>}
                    </div>
                    <p className="text-xs text-gray-600">{addr.address_line_1} {addr.address_line_2}</p>
                    <p className="text-xs text-gray-600">{addr.city}, {addr.state} {addr.postal_code}</p>
                    <p className="text-xs text-gray-400 mt-2">{addr.phone}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Address Form */}
            {showNewAddress && (
              <form onSubmit={handleCreateAddress} className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <h4 className="text-sm font-bold text-gray-900">New Address Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text" placeholder="Full Name" value={newAddr.full_name} required
                    onChange={(e) => setNewAddr({ ...newAddr, full_name: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-sm outline-none"
                  />
                  <input
                    type="text" placeholder="Phone" value={newAddr.phone} required
                    onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-sm outline-none"
                  />
                </div>
                <input
                  type="text" placeholder="Address Line 1" value={newAddr.address_line_1} required
                  onChange={(e) => setNewAddr({ ...newAddr, address_line_1: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-sm outline-none"
                />
                <input
                  type="text" placeholder="Address Line 2 (Optional)" value={newAddr.address_line_2}
                  onChange={(e) => setNewAddr({ ...newAddr, address_line_2: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-sm outline-none"
                />
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text" placeholder="City" value={newAddr.city} required
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
                  />
                  <input
                    type="text" placeholder="State" value={newAddr.state} required
                    onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
                  />
                  <input
                    type="text" placeholder="Postal Code" value={newAddr.postal_code} required
                    onChange={(e) => setNewAddr({ ...newAddr, postal_code: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  {addresses.length > 0 && (
                    <button type="button" onClick={() => setShowNewAddress(false)} className="px-4 py-2 text-xs font-semibold text-gray-600">
                      Cancel
                    </button>
                  )}
                  <button type="submit" className="px-5 py-2 bg-gray-900 text-white rounded-xl font-bold text-xs">
                    Save Address
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Step 2: Payment Method */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">2</div>
              <h3 className="text-xl font-bold text-gray-900">Payment Option</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setPaymentMethod('CREDIT_CARD')}
                className={`p-4 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                  paymentMethod === 'CREDIT_CARD' ? 'border-emerald-600 bg-emerald-50/50 shadow-md' : 'border-gray-200'
                }`}
              >
                <CreditCard className="w-6 h-6 text-emerald-600" />
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Credit / Debit Card</h4>
                  <p className="text-xs text-gray-500">Velora Secure Payment Gateway</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Summary Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md space-y-6 sticky top-28">
            <h3 className="font-serif text-xl font-bold text-gray-900 pb-4 border-b border-gray-100">Order Summary</h3>

            {/* Items Brief */}
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="font-bold text-gray-900">{item.quantity}x</span>
                    <span className="text-gray-700 truncate">{item.product?.name}</span>
                  </div>
                  <span className="font-bold text-gray-900 shrink-0">${(Number(item.total_price) || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="pt-4 border-t border-gray-100 space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Coupon Code</label>
              <div className="flex gap-2">
                <input
                  type="text" placeholder="e.g. WELCOME10" value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-emerald-600"
                />
                <button
                  type="submit" disabled={validatingCoupon}
                  className="px-4 py-2 bg-gray-900 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl"
                >
                  {validatingCoupon ? '...' : 'Apply'}
                </button>
              </div>
              {appliedCoupon && (
                <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Coupon {appliedCoupon.code} applied (-${discountAmount.toFixed(2)})
                </div>
              )}
            </form>

            {/* Calculation Totals */}
            <div className="space-y-2.5 text-sm pt-4 border-t border-gray-100">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount</span><span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shippingFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `$${shippingFee.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-gray-600"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-between items-baseline">
              <span className="text-base font-bold text-gray-900">Total Due</span>
              <span className="text-2xl font-extrabold text-emerald-600">${grandTotal.toFixed(2)}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={submitting || !selectedAddressId}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShieldCheck className="w-5 h-5" />
              {submitting ? 'Processing Order...' : 'Confirm & Pay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
