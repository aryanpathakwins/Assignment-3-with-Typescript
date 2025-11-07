import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../Redux/store";
import {
  removeFromCart,
  clearCart,
  updateQuantity,
} from "../../Redux/cartSlice";
import {
  updateStockLocally,
  updateStockAfterPurchase,
} from "../../Redux/cardSlice"; 
import { Button, Modal, message, Empty, InputNumber } from "antd";

const Cart: React.FC = () => {
  const { cartItems } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch<AppDispatch>();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const totalPrice = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + (item.price || 0) * (item.quantity || 1),
        0
      ),
    [cartItems]
  );

  // ✅ Finalized Payment Logic
  const handlePayment = async () => {
    if (cartItems.length === 0) {
      message.warning("Your cart is empty.");
      return;
    }

    setLoading(true);

    try {
      
      cartItems.forEach((item) => {
    //     dispatch(
    //     //   updateStockLocally({
    //     //     id: item.id,
    //     //     quantityPurchased: item.quantity,
    //     //   })
    //     );
      });

      
      await Promise.all(
        cartItems.map((item) =>
          dispatch(
            updateStockAfterPurchase({
              id: item.id,
              quantityPurchased: item.quantity,
            })
          )
        )
      );

      
      setLoading(false);
      setIsPaymentOpen(false);
      message.success("✅ Payment successful! Stock updated accordingly.");
      dispatch(clearCart());
    } catch (error) {
      console.error("Stock update failed:", error);
      setLoading(false);
      setIsPaymentOpen(false);
      message.error(
        "Payment completed locally but failed to sync stock to server. Refresh or retry."
      );
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[70vh] bg-gray-50">
        <Empty description="Your cart is empty" />
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8 flex flex-col lg:flex-row gap-6">
      {/* Left Section */}
      <div className="flex-1 bg-white rounded-lg shadow-md p-4">
        <h2 className="text-2xl font-semibold mb-4">Shopping Cart</h2>
        <hr className="mb-4" />

        {cartItems.map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b py-4 gap-4"
          >
            <div className="flex gap-4 items-start">
              <img
                src={item.image}
                alt={item.title}
                className="w-28 h-28 object-contain border rounded-md"
              />
              <div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-gray-600 text-sm max-w-md line-clamp-2">
                  {item.description}
                </p>
                <p
                  className={`text-sm mt-1 ${
                    item.stock > 0 ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {item.stock > 0 ? `In stock: ${item.stock}` : "Out of stock"}
                </p>

                <div className="flex items-center gap-3 mt-3">
                  <InputNumber
                    min={1}
                    max={item.stock}
                    value={item.quantity || 1}
                    onChange={(val) => {
                      if (typeof val === "number" && val <= item.stock) {
                        dispatch(updateQuantity({ id: item.id, quantity: val }));
                      } else {
                        message.warning(
                          `Only ${item.stock} items available in stock`
                        );
                      }
                    }}
                    disabled={item.stock === 0}
                  />

                  <Button
                    type="link"
                    className="text-red-500"
                    onClick={() => dispatch(removeFromCart(item.id))}
                  >
                    Delete
                  </Button>
                  <Button type="link" className="text-yellow-600">
                    Save for later
                  </Button>
                </div>
              </div>
            </div>
            <div className="text-lg font-semibold text-gray-800">
              ${(item.price * (item.quantity || 1)).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Right Section */}
      <div className="w-full lg:w-80 bg-white rounded-lg shadow-md p-4 h-fit">
        <p className="text-lg font-medium text-gray-800 mb-4">
          Subtotal ({cartItems.length}{" "}
          {cartItems.length === 1 ? "item" : "items"}):{" "}
          <span className="font-semibold text-xl text-green-700">
            ${(totalPrice).toLocaleString()}
          </span>
        </p>

        <Button
          type="primary"
          className="bg-yellow-500 hover:bg-yellow-600 text-black w-full font-semibold"
          onClick={() => setIsPaymentOpen(true)}
          disabled={cartItems.some((i) => i.stock === 0)}
        >
          Proceed to Buy
        </Button>

        <div className="mt-4 flex justify-center">
          <Button danger onClick={() => dispatch(clearCart())}>
            Clear Cart
          </Button>
        </div>
      </div>

      {/* Payment Modal */}
      <Modal
        title="Confirm Payment"
        open={isPaymentOpen}
        onCancel={() => setIsPaymentOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsPaymentOpen(false)}>
            Cancel
          </Button>,
          <Button
            key="pay"
            type="primary"
            loading={loading}
            onClick={handlePayment}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Pay ₹{totalPrice.toLocaleString()}
          </Button>,
        ]}
      >
        <p className="text-gray-700">
          You're about to pay <strong>${totalPrice.toLocaleString()}</strong> for{" "}
          {cartItems.length} {cartItems.length === 1 ? "item" : "items"}.
        </p>
        <p className="mt-2 text-gray-600">
          This is a mock checkout. Replace with Razorpay/Stripe later for real
          payments.
        </p>
      </Modal>
    </div>
  );
};

export default Cart;
