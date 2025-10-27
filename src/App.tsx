import React, { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { store, type AppDispatch } from "./Redux/store";
import AppRoutes from "./Routes/AppRoutes";
import { fetchUsers } from "./Redux/useslice";
import { fetchCards } from "./Redux/cardSlice"; // ✅ new import

const PreloadData: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchCards()); // ✅ preload cards
  }, [dispatch]);

  return children;
};

const App = () => (
  <Provider store={store}>
    <PreloadData>
      <AppRoutes />
    </PreloadData>
  </Provider>
);

export default App;
