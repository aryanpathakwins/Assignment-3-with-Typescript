// import React from "react";
// import type CardType  from "../../types/CardTypes";
// import { useDispatch } from "react-redux";
// import { deleteCard } from "../../Redux/cardSlice";
// import  type { AppDispatch } from "../../Redux/store";

// interface CardItemProps {
//   card: CardType;
//   onEdit: (card: CardType) => void;
// }

// const CardItem: React.FC<CardItemProps> = ({ card, onEdit }) => {
//   const dispatch = useDispatch<AppDispatch>();



//   return (
//     <div className="bg-white p-4 shadow rounded-xl w-72 hover:shadow-lg transition">
//       {card.image && (
//         <img
//           src={card.image}
//           alt={card.title}
//           className="w-full h-40 object-cover rounded-md mb-3"
//         />
//       )}
//       <h3 className="text-lg font-semibold">{card.title}</h3>
//       {card.description && (
//         <p className="text-gray-600 text-sm mb-4">{card.description}</p>
//       )}
//     </div>
//   );
// };

// export default CardItem;
