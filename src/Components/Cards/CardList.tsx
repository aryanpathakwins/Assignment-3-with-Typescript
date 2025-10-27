import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../Redux/store";
import { fetchCards, deleteCard } from "../../Redux/cardSlice";
import CardForm from "./CardForms";
import type CardType from "../../types/CardTypes";

const CardList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { cards, loading, error } = useSelector((state: RootState) => state.cards);

  const [editingCard, setEditingCard] = useState<CardType | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    dispatch(fetchCards());
  }, [dispatch]);

  const handleAddCard = () => {
    setEditingCard(null);
    setShowForm(true);
  };

  const handleEditCard = (card: CardType) => {
    setEditingCard(card);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this card?")) {
      dispatch(deleteCard(id));
    }
  };

  if (loading)
    return <p className="text-center text-gray-500 mt-10">Loading cards...</p>;

  if (error)
    return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-5 gap-3">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 text-center sm:text-left">
          Card List
        </h2>
        <button
          onClick={handleAddCard}
          className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm sm:text-base hover:bg-blue-700 transition-all w-full sm:w-auto"
        >
          + Add Card
        </button>
      </div>

      {/* Empty State */}
      {cards.length === 0 ? (
        <p className="text-center text-gray-500 mt-10 text-sm sm:text-base">
          No cards available.
        </p>
      ) : (
        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
            gap-5
          "
        >
          {cards.map((card) => (
            <div
              key={card.id}
              className="
                bg-white
                rounded-xl
                shadow-md
                hover:shadow-lg
                transition-all
                duration-200
                overflow-hidden
                flex
                flex-col
              "
            >
              {card.image && (
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-44 sm:h-48 object-cover"
                />
              )}

              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-gray-800 truncate">
                  {card.title}
                </h3>

                {card.description && (
                  <p className="text-gray-600 mt-2 text-sm sm:text-base line-clamp-3">
                    {card.description}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row justify-between gap-2 mt-4">
                  <button
                    onClick={() => handleEditCard(card)}
                    className="
                      px-3 py-1.5 text-sm rounded-md bg-yellow-500 text-white
                      hover:bg-yellow-600 transition
                    "
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(card.id)}
                    className="
                      px-3 py-1.5 text-sm rounded-md bg-red-500 text-white
                      hover:bg-red-600 transition
                    "
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <CardForm editingCard={editingCard} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
};

export default CardList;
