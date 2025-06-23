import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [drugDetails, setDrugDetails] = useState({}); // { [drugId]: {name, image, category, ...} }
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  // Fetch drug details for all items in the cart
  useEffect(() => {
    const fetchDrugDetails = async () => {
      const details = {};
      for (const item of cartItems) {
        if (!details[item.drugId]) {
          try {
            const response = await axios.get(`http://localhost:8080/api/drugs-view/${item.drugId}/details`);
            details[item.drugId] = response.data.data;
          } catch (error) {
            details[item.drugId] = { drugName: 'Unknown Drug', image: '', category: 'Unknown' };
          }
        }
      }
      setDrugDetails(details);
    };
    if (cartItems.length > 0) fetchDrugDetails();
  }, [cartItems]);

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // First, create the order
      const orderData = {
        totalPrice: calculateTotal(),
        paymentMethod: "CASH", // You can add payment method selection
        status: "PENDING"
      };

      const orderResponse = await axios.post(
        "http://localhost:8080/api/orders/place/order",
        orderData,
        { headers: { token } }
      );

      const orderId = orderResponse.data.data.id;

      // Group items by branch
      const itemsByBranch = {};
      cartItems.forEach(item => {
        if (!itemsByBranch[item.branchId]) {
          itemsByBranch[item.branchId] = [];
        }
        itemsByBranch[item.branchId].push({
          drugId: item.drugId,
          quantity: item.quantity,
          price: item.price
        });
      });

      // Create requests for each branch
      const requestPromises = Object.entries(itemsByBranch).map(async ([branchId, items]) => {
        const requestData = {
          branchId: branchId,
          orderId: orderId,
          items: items,
          status: "PENDING",
          customer: {
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            address: user.address,
            city: user.city
          }
        };

        return axios.post(
          "http://localhost:8080/api/requests/save",
          requestData,
          { headers: { token } }
        );
      });

      // Wait for all requests to be created
      await Promise.all(requestPromises);

      // Clear the cart after successful order placement
      setCartItems([]);
      setMessage('Order placed successfully!');
      setMessageType('success');

      // Navigate to order status page
      navigate(`/orders/${orderId}`);
    } catch (error) {
      console.error('Error placing order:', error);
      setMessage('Failed to place order');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Cart Items List */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Your Cart</h2>
        {cartItems.length === 0 ? (
          <p className="text-gray-500">Your cart is empty.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {cartItems.map((item) => {
              const details = drugDetails[item.drugId] || {};
              return (
                <li key={item.drugId} className="py-4 flex items-center">
                  {details.image ? (
                    <img src={details.image} alt={details.drugName} className="w-16 h-16 object-cover rounded mr-4" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded mr-4 flex items-center justify-center text-gray-400">No Image</div>
                  )}
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{details.drugName || 'Unknown Drug'}</div>
                    <div className="text-sm text-gray-500">Category: {details.category || 'Unknown'}</div>
                    <div className="text-sm text-gray-500">Quantity: {item.quantity}</div>
                    <div className="text-sm text-gray-500">Price: ${item.price}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      
      {/* Add Place Order button */}
      {cartItems.length > 0 && (
        <div className="mt-6">
          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full py-3 px-6 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <ShoppingCartIcon className="h-5 w-5 mr-2" />
                Place Order
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default CartPage; 