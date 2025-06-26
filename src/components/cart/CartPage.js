import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShoppingCartIcon, TrashIcon, ArrowLeftIcon, CurrencyDollarIcon, MinusIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [drugDetails, setDrugDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [paymentMethod, setPaymentMethod] = useState("");
  const [visaInfo, setVisaInfo] = useState({ cardNumber: "", expiry: "", cvv: "" });
  const [placingOrder, setPlacingOrder] = useState(false);
  const [promo, setPromo] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  // Fetch cart for the user
  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:8080/api/cart/items', {
          headers: { token },
        });
        setCart(response.data.data);
        setLoading(false);
      } catch (error) {
        setCart(null);
        setLoading(false);
      }
    };
    fetchCart();
  }, [userId, token]);

  // Fetch drug details for each item
  useEffect(() => {
    if (!cart || !cart.items) return;
    const fetchDetails = async () => {
      const details = {};
      await Promise.all(
        cart.items.map(async (item) => {
          try {
            const res = await axios.get(`http://localhost:8080/api/drugs/${item.drugId}`);
            details[item.drugId] = res.data.data;
          } catch (e) {
            details[item.drugId] = null;
          }
        })
      );
      setDrugDetails(details);
    };
    fetchDetails();
  }, [cart]);

  // Fetch user location on mount
  useEffect(() => {
    const fetchLocation = async () => {
      setLocationLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get('http://localhost:8080/api/location/get', { headers: { token } });
        if (res.data.status && res.data.data) {
          setUserLocation({ lat: res.data.data.lat, lng: res.data.data.lng });
        } else {
          setUserLocation(null);
        }
      } catch {
        setUserLocation(null);
      } finally {
        setLocationLoading(false);
      }
    };
    fetchLocation();
  }, []);

  const handleRemove = async (itemId) => {
    setRemoving(itemId);
    try {
      const itemToRemove = cart.items.find(item => item.id === itemId);
      await axios.delete('http://localhost:8080/api/cart/remove', {
        headers: { token },
        data: {
          id: itemToRemove.id,
          orderId: itemToRemove.orderId,
          drugId: itemToRemove.drugId,
          price: itemToRemove.price,
          quantity: itemToRemove.quantity,
          userId: itemToRemove.userId
        }
      });
      setCart((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.id !== itemId),
      }));
      setFeedback('Item removed from cart.');
      setTimeout(() => setFeedback(''), 2000);
    } catch (e) {
      setFeedback('Failed to remove item.');
      setTimeout(() => setFeedback(''), 2000);
    } finally {
      setRemoving(null);
    }
  };

  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity < 1) return;
    setUpdating(item.id);
    const token = localStorage.getItem('token');
    const updatedItem = {
      orderId: item.orderId ?? null,
      drugId: item.drugId,
      price: item.price,
      quantity: newQuantity,
      userId: item.userId
    };
    try {
      await axios.put(
        `http://localhost:8080/api/items/update/${item.id}`,
        updatedItem,
        { headers: { token } }
      );
      setCart((prev) => ({
        ...prev,
        items: prev.items.map((i) => (i.id === item.id ? { ...i, quantity: newQuantity } : i)),
      }));
      setFeedback('Quantity updated.');
      setTimeout(() => setFeedback(''), 2000);
    } catch (e) {
      setFeedback('Failed to update quantity.');
      setTimeout(() => setFeedback(''), 2000);
    } finally {
      setUpdating(null);
    }
  };

  const subtotal = cart?.items?.reduce((sum, item) => {
    return sum + (Number(item.price) * item.quantity);
  }, 0) || 0;

  const deliveryFee = subtotal > 0 ? 20 : 0;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!paymentMethod) return;
    setPlacingOrder(true);
    try {
      const order = {
        status: "PENDING",
        paymentMethod,
        userId: Number(userId),
        totalPrice: total,
        requestsIds: [], // Adjust if you have request IDs in cart
      };
      await axios.post(
        "http://localhost:8080/api/orders/place/order",
        order,
        { headers: { token } }
      );
      setFeedback("Order placed successfully!");
      setCart({ ...cart, items: [] }); // Clear cart in UI
      setTimeout(() => {
        setFeedback("");
        navigate("/orders"); // Redirect to order status/confirmation page
      }, 1500);
    } catch (e) {
      setFeedback("Failed to place order.");
      setTimeout(() => setFeedback("") , 2000);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50">
        <ShoppingCartIcon className="h-16 w-16 text-primary-200 mb-6" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Browse products and add them to your cart.</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" /> Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
        {/* Left: Cart Items */}
        <div className="flex-1">
          <div className="flex items-center mb-6">
            <button onClick={() => navigate(-1)} className="mr-4 text-gray-600 bg-transparent hover:bg-gray-100 hover:text-primary-600 transition-colors px-5 py-3 rounded-xl text-2xl">
              &larr;
            </button>
            <h1 className="text-4xl md:text-5xl font-bold mr-4">Shopping Cart</h1>
            {cart.items.length > 0 && (
              <span className="ml-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">{cart.items.length} items</span>
            )}
          </div>
          <div className="space-y-4 mt-24">
            {cart.items.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">Your cart is empty.</div>
            ) : (
              cart.items.map((item) => {
                const drug = drugDetails[item.drugId] || {};
                return (
                  <div key={item.id} className="bg-white rounded-2xl shadow-lg flex flex-col md:flex-row items-center md:items-stretch p-6 gap-6 border border-gray-100">
                    {/* Clickable Image and Name */}
                    <div className="flex flex-1 min-w-0 items-center gap-6 cursor-pointer" onClick={() => navigate(`/drug/details/${item.drugId}`)}>
                      <div className="w-28 h-28 md:w-32 md:h-32 bg-gray-100 rounded flex items-center justify-center text-gray-300 text-2xl">
                        {drug.logo ? <img src={drug.logo} alt={drug.drugName} className="w-full h-full object-cover rounded" /> : <span>No Image</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-2xl md:text-3xl">{drug.drugName || 'Unknown Drug'}</div>
                        <div className="text-xs text-gray-500 mb-1">{drug.companyName || ''}</div>
                        {drug.prescriptionRequired && (
                          <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded mb-1">Prescription Required</span>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xl font-bold text-gray-900">${item.price}</span>
                          {drug.oldPrice && (
                            <span className="text-sm text-gray-400 line-through">${drug.oldPrice}</span>
                          )}
                        </div>
                        {drug.available === false && (
                          <div className="text-xs text-red-600 mt-1 flex items-center gap-1"><span>Currently out of stock</span></div>
                        )}
                      </div>
                    </div>
                    {/* Controls */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleQuantityChange(item, item.quantity - 1)} disabled={item.quantity === 1 || updating === item.id} className="w-8 h-8 rounded border border-gray-200 bg-white text-blue-600 hover:bg-blue-50">-</button>
                        <span className="px-3 py-1 rounded bg-gray-50 border border-gray-200 text-base font-semibold">{item.quantity}</span>
                        <button onClick={() => handleQuantityChange(item, item.quantity + 1)} disabled={updating === item.id} className="w-8 h-8 rounded border border-gray-200 bg-white text-blue-600 hover:bg-blue-50">+</button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setFeedback('Saved for later!')} className="flex items-center gap-1 border border-gray-200 bg-white text-gray-500 hover:text-blue-600 hover:bg-blue-50 text-sm"><span>&#9825;</span>Save</button>
                        <button onClick={() => handleRemove(item.id)} className="border border-gray-200 bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 text-sm"><TrashIcon className="h-5 w-5" /></button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {/* Promo Code */}
          <div className="bg-white rounded-xl shadow p-4 mt-6 flex flex-col md:flex-row items-center gap-4 border border-gray-100">
            <div className="font-semibold mb-2 md:mb-0">Promo Code</div>
            <input
              type="text"
              value={promo}
              onChange={e => setPromo(e.target.value)}
              placeholder="Enter promo code"
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
            <button className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-primary-100 text-primary-700 font-semibold transition-colors">Apply</button>
          </div>
        </div>
        {/* Right: Order Summary */}
        <div className="w-full lg:w-96 flex-shrink-0 self-start mt-24">
          <div className="bg-white rounded-2xl shadow-xl p-10 border-2 border-blue-100 sticky top-8 w-full lg:w-[420px] min-h-[500px]">
            <div className="flex items-center gap-2 mb-4">
              <CurrencyDollarIcon className="h-6 w-6 text-primary-600" />
              <span className="text-lg font-bold">Order Summary</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span>Shipping</span>
              <span>{deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span>Tax</span>
              <span>${(subtotal * 0.08).toFixed(2)}</span>
            </div>
            <div className="border-t my-3"></div>
            <div className="flex justify-between items-center text-lg font-bold mb-2">
              <span>Total</span>
              <span>${(subtotal + deliveryFee + subtotal * 0.08).toFixed(2)}</span>
            </div>
            {deliveryFee === 0 && (
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded mb-2 text-sm">
                <span>&#10003;</span> Free shipping applied!
              </div>
            )}
            <div className="flex items-center gap-2 mb-4">
              <input type="checkbox" checked readOnly className="accent-primary-600" />
              <span className="text-xs text-gray-600">Secure checkout protected</span>
            </div>
            {/* Payment method selection and fake Visa fields */}
            <div className="mb-4">
              <label className="block font-medium mb-2">Payment Method</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash"
                    checked={paymentMethod === "Cash"}
                    onChange={() => setPaymentMethod("Cash")}
                    className="mr-2"
                  />
                  Cash
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Visa"
                    checked={paymentMethod === "Visa"}
                    onChange={() => setPaymentMethod("Visa")}
                    className="mr-2"
                  />
                  Visa
                </label>
              </div>
            </div>
            {paymentMethod === "Visa" && (
              <div className="mb-4 space-y-2">
                <input
                  type="text"
                  placeholder="Card Number"
                  value={visaInfo.cardNumber}
                  onChange={e => setVisaInfo({ ...visaInfo, cardNumber: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={visaInfo.expiry}
                    onChange={e => setVisaInfo({ ...visaInfo, expiry: e.target.value })}
                    className="w-1/2 border rounded px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    value={visaInfo.cvv}
                    onChange={e => setVisaInfo({ ...visaInfo, cvv: e.target.value })}
                    className="w-1/2 border rounded px-3 py-2"
                  />
                </div>
              </div>
            )}
            <button
              onClick={handlePlaceOrder}
              disabled={placingOrder || !paymentMethod || (paymentMethod === "Visa" && (!visaInfo.cardNumber || !visaInfo.expiry || !visaInfo.cvv)) || !userLocation}
              className="w-full py-2 rounded-lg bg-primary-700 hover:bg-primary-800 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-2"
            >
              {placingOrder ? "Placing Order..." : "Place Order"}
            </button>
            {!userLocation && !locationLoading && (
              <div className="text-red-600 text-sm text-center mb-2">You need to add your location first before placing an order.</div>
            )}
            <button
              onClick={() => navigate('/')} 
              className="w-full py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold transition-colors"
            >
              Continue Shopping
            </button>
            <div className="mt-6 text-center text-xs text-gray-400">
              We accept<br />
              <span className="inline-flex gap-2 mt-1">
                <span className="px-2 py-1 border rounded">VISA</span>
                <span className="px-2 py-1 border rounded">MC</span>
                <span className="px-2 py-1 border rounded">AMEX</span>
                <span className="px-2 py-1 border rounded">CASH</span>
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Message */}
      {feedback && (
        <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg z-50 bg-green-100 text-green-800`}>{feedback}</div>
      )}
    </div>
  );
};

export default CartPage; 