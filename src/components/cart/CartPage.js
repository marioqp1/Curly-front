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
    <div className="min-h-screen bg-gray-50 py-12 font-sans">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
            <h1 className="text-4xl font-bold text-gray-800 flex items-center">
              <ShoppingCartIcon className="h-10 w-10 mr-4 text-blue-600" />
              Your Cart
            </h1>
            <button
                onClick={() => navigate('/')}
                className="flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors"
            >
                <ArrowLeftIcon className="h-5 w-5 mr-2" /> Continue Shopping
            </button>
        </div>

        {feedback && (
          <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-primary-600 text-white px-6 py-3 rounded-lg shadow-lg transition-all animate-bounce">
            {feedback}
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-8">
            {cart.items.map((item) => {
              const drug = drugDetails[item.drugId];
              return (
                <div key={item.id} className="flex bg-white rounded-xl shadow-md overflow-hidden p-6 items-center">
                  <div className="flex-shrink-0 w-36 h-36 bg-gray-100 rounded-lg flex items-center justify-center">
                    {drug && drug.logo ? (
                      <img src={drug.logo} alt={drug.drugName} className="w-32 h-32 object-contain" />
                    ) : (
                      <ShoppingCartIcon className="w-20 h-20 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex-1 ml-6">
                    <h2 className="text-lg font-bold text-gray-800">{drug ? drug.drugName : 'Unknown Drug'}</h2>
                    <p className="text-sm text-gray-500">{drug ? drug.description.substring(0,50)+'...' : ''}</p>
                    <span className="text-lg font-semibold text-blue-600 mt-1">${item.price}</span>
                  </div>
                  
                  <div className="flex flex-col items-center justify-between h-36 ml-6">
                    <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item, item.quantity - 1)}
                          disabled={item.quantity === 1 || updating === item.id}
                          className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 transition"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="text-lg font-bold w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item, item.quantity + 1)}
                          disabled={updating === item.id}
                          className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 transition"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                    </div>
                    <button
                        onClick={() => handleRemove(item.id)}
                        disabled={removing === item.id}
                        className="p-2 rounded-md text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
                        title="Remove item"
                      >
                        {removing === item.id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                        ) : (
                            <TrashIcon className="h-5 w-5" />
                        )}
                      </button>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Cart Summary */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 h-fit sticky top-24">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span className="font-medium text-gray-900">${deliveryFee.toFixed(2)}</span>
              </div>
            </div>
            <div className="border-t border-gray-200 my-4"></div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-base font-medium text-gray-900">Total</span>
              <span className="text-2xl font-bold text-blue-600">${total.toFixed(2)}</span>
            </div>
            {/* Payment Method Selection */}
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

            {/* Visa Form (Design Only) */}
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

            {/* Place Order Button */}
            <button
              className={`w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-base shadow-md ${placingOrder ? "opacity-60 cursor-not-allowed" : ""}`}
              onClick={handlePlaceOrder}
              disabled={
                placingOrder ||
                !paymentMethod ||
                (paymentMethod === "Visa" && (!visaInfo.cardNumber || !visaInfo.expiry || !visaInfo.cvv))
              }
            >
              {placingOrder ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage; 