import React, { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../Redux/store";
import { fetchCards, deleteCard, updateCard } from "../../Redux/cardSlice";
import { fetchUsers, updateUser } from "../../Redux/useslice";
import CardForm from "./CardForms";
import type CardType from "../../types/CardTypes";
import { Modal, Select, InputNumber, message, Button } from "antd";
import {
  ShoppingCartOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";

const CardList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { cards, loading, error } = useSelector((state: RootState) => state.cards);
  const { users } = useSelector((state: RootState) => state.user);

  const [editingCard, setEditingCard] = useState<CardType | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [buyModalVisible, setBuyModalVisible] = useState(false);
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [postalCode, setPostalCode] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [purchaseQuantity, setPurchaseQuantity] = useState<number>(1);

  useEffect(() => {
    dispatch(fetchCards());
    dispatch(fetchUsers());
  }, [dispatch]);

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedUserId),
    [users, selectedUserId]
  );

  const selectedProduct = useMemo(
    () => cards.find((c) => c.id === selectedProductId),
    [cards, selectedProductId]
  );

  const filteredProducts = useMemo(() => {
    if (!postalCode.trim()) return [];
    return cards.filter(
      (card) => (card.zip || "").toLowerCase() === postalCode.toLowerCase()
    );
  }, [cards, postalCode]);

  const handleAddCard = () => {
    setEditingCard(null);
    setShowForm(true);
  };

  const handleEditCard = (card: CardType) => {
    setEditingCard(card);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      dispatch(deleteCard(id));
    }
  };

  const handleBuy = () => {
    if (!selectedUserId || !postalCode || !selectedProductId) {
      message.warning("Please select user, postal code, and product.");
      return;
    }

    const product = cards.find((c) => c.id === selectedProductId);
    if (!product) return message.error("Product not found.");
    if (product.quantity <= 0) return message.warning("Out of stock!");
    if (purchaseQuantity <= 0) return message.warning("Please select a valid quantity.");
    if (purchaseQuantity > product.quantity)
      return message.warning(`Only ${product.quantity} in stock.`);

    setReceiptModalVisible(true);
  };

 const handleConfirmBuy = async () => {
  const product = cards.find((c) => c.id === selectedProductId);
  const user = users.find((u) => u.id === selectedUserId);
  if (!product || !user) return;

  // prevent double purchase if product stock is already 0
  if (product.quantity <= 0) {
    message.warning("This product is out of stock!");
    return;
  }

  // Decrease product quantity
  const updatedCard = {
    ...product,
    quantity: product.quantity - purchaseQuantity,
  };
  await dispatch(updateCard(updatedCard));

  // Handle user purchase update
  const existingPurchases = user.purchasedProducts || [];
  const existingProductIndex = existingPurchases.findIndex(
    (p) => p.productId === product.id
  );

  let updatedPurchases;
  if (existingProductIndex >= 0) {
    
    updatedPurchases = existingPurchases.map((p, index) =>
      index === existingProductIndex
        ? { ...p, quantity: p.quantity + purchaseQuantity }
        : p
    );
  } else {
    updatedPurchases = [
      ...existingPurchases,
      {
        productId: product.id,
        productName: product.title,
        quantity: purchaseQuantity,
        price: product.price,
      },
    ];
  }

  // Update user record
  const updatedUser = {
    ...user,
    purchasedProducts: updatedPurchases,
  };
  await dispatch(updateUser(updatedUser));

  message.success(
    `${user.fullName} purchased ${purchaseQuantity} × "${product.title}" successfully!`
  );

  // Reset modal state
  setReceiptModalVisible(false);
  setBuyModalVisible(false);
  setSelectedUserId("");
  setPostalCode("");
  setSelectedProductId("");
  setPurchaseQuantity(1);
};


  const formatAddress = (user: any) => {
    if (!user) return "—";
    const parts = [
      user.address1,
      user.address2,
      user.city,
      user.state,
      user.zip,
      user.country,
    ].filter(Boolean);
    return parts.length ? parts.join(", ") : "—";
  };

  if (loading)
    return <p className="text-center text-gray-500 mt-10">Loading products...</p>;
  if (error)
    return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold text-gray-800">🛍️ Product Management</h2>
        <button
          onClick={handleAddCard}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium hover:opacity-90 transition-all shadow-md hover:shadow-lg cursor-pointer"
        >
          <PlusOutlined /> Add Product
        </button>
      </div>

      {/* Products Grid */}
      {cards.length === 0 ? (
        <p className="text-center text-gray-500 text-lg mt-12">No products available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cards.map((card) => (
            <div
              key={card.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex flex-col relative"
            >
              {/* Image with overlay icons */}
              <div className="relative cursor-pointer">
                {card.image ? (
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                    No Image
                  </div>
                )}

                {/* Floating edit & delete icons */}
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditCard(card)}
                    className="p-2 rounded-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 shadow-md cursor-pointer"
                    title="Edit Product"
                  >
                    <EditOutlined />
                  </button>

                  {card.quantity === 0 && (
                    <button
                      onClick={() => handleDelete(card.id)}
                      className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-md cursor-pointer"
                      title="Delete Product"
                    >
                      <DeleteOutlined />
                    </button>
                  )}
                </div>
              </div>

              {/* Card content */}
              <div className="p-5 flex flex-col flex-grow">
                <h3
                  className="text-lg font-semibold text-gray-900 mb-1 truncate cursor-pointer"
                  onClick={() => handleEditCard(card)}
                  title="Click to edit"
                >
                  {card.title}
                </h3>
                {card.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {card.description}
                  </p>
                )}

                <div className="text-sm text-gray-700 space-y-1 flex-grow">
                  <p>
                    <strong>💰 Price:</strong> ${card.price}
                  </p>
                  <p>
                    <strong>📦 Stock:</strong>{" "}
                    {card.quantity > 0 ? card.quantity : "N/A"}
                  </p>
                  {(card.city || card.state || card.country) && (
                    <div className="mt-2 text-gray-600 text-xs border-t pt-2">
                      <p className="font-semibold">Address:</p>
                      <p>
                        {[card.city, card.state].filter(Boolean).join(", ")}{" "}
                        {card.country && `- ${card.country}`}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setBuyModalVisible(true);
                    setSelectedProductId("");
                    setPostalCode("");
                    setPurchaseQuantity(1);
                  }}
                  className="mt-5 flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-md bg-green-600 text-white font-medium hover:bg-green-700 transition-all w-full cursor-pointer"
                >
                  <ShoppingCartOutlined /> Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Buy Modal */}
      <Modal
        open={buyModalVisible}
        onCancel={() => setBuyModalVisible(false)}
        footer={null}
        title="🛒 Buy Product"
        centered
      >
        <label className="block text-gray-700 font-medium mb-1">Select User</label>
        <Select
          showSearch
          placeholder="Select an active user"
          value={selectedUserId || undefined}
          onChange={(value) => {
            setSelectedUserId(value);
            const user = users.find((u) => u.id === value);
            setPostalCode(user?.zip || "");
          }}
          className="w-full mb-4 cursor-pointer"
        >
          {users
            .filter((user) => user.isActive)
            .map((user) => (
              <Select.Option key={user.id} value={user.id}>
                {user.fullName} ({user.city})
              </Select.Option>
            ))}
        </Select>

        <label className="block text-gray-700 font-medium mb-1">Available Products</label>
        <Select
          placeholder={postalCode ? "Select a product" : "Enter postal code first"}
          value={selectedProductId || undefined}
          onChange={(value) => {
            setSelectedProductId(value);
            setPurchaseQuantity(1);
          }}
          className="w-full mb-4 cursor-pointer"
        >
          {filteredProducts.map((card) => (
            <Select.Option key={card.id} value={card.id}>
              {card.title} (${card.price})
            </Select.Option>
          ))}
        </Select>

        {selectedProduct && (
          <div className="mt-2 mb-5">
            <label className="block text-gray-700 font-medium mb-1">
              Quantity (Available: {selectedProduct.quantity > 0 ? selectedProduct.quantity : "N/A"})
            </label>
            <InputNumber
              min={1}
              max={selectedProduct.quantity}
              value={purchaseQuantity}
              onChange={(value) => setPurchaseQuantity(value || 1)}
              className="w-full"
            />
          </div>
        )}

        <Button
          type="primary"
          onClick={handleBuy}
          className="w-full bg-green-600 hover:bg-green-700 h-10 font-semibold cursor-pointer"
        >
          Review Purchase
        </Button>
      </Modal>

      {/* Receipt Modal */}
      <Modal
        open={receiptModalVisible}
        onCancel={() => setReceiptModalVisible(false)}
        footer={null}
        title="🧾 Purchase Receipt"
        centered
      >
        {selectedProduct && selectedUser && (
          <div className="space-y-3 text-gray-700 text-sm">
            <p>
              <strong>👤 Buyer:</strong> {selectedUser.fullName}
            </p>
            <p>
              <strong>🏠 Address:</strong> {formatAddress(selectedUser)}
            </p>
            <p>
              <strong>📦 Product:</strong> {selectedProduct.title}
            </p>
            <p>
              <strong>🧮 Quantity:</strong> {purchaseQuantity}
            </p>
            <p>
              <strong>💵 Price per Unit:</strong> ${selectedProduct.price}
            </p>
            <p className="border-t pt-2 text-base font-semibold">
              <strong>Total:</strong> ${selectedProduct.price * purchaseQuantity}
            </p>
          </div>
        )}

        <Button
          type="primary"
          onClick={handleConfirmBuy}
          className="w-full mt-5 bg-blue-600 hover:bg-blue-700 h-10 font-semibold cursor-pointer"
        >
          Confirm Purchase
        </Button>
      </Modal>

      {showForm && <CardForm editingCard={editingCard} onClose={() => setShowForm(false)} />}
    </div>
  );
};

export default CardList;
