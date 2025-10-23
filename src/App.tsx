import React, { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { store, type AppDispatch } from "./Redux/store";
import AppRoutes from "./Routes/AppRoutes";
import { fetchUsers } from "./Redux/useslice";

const PreloadUsers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();     // used the type dispatch from store

  useEffect(() => {
    dispatch(fetchUsers()); // fetch all users on app start
  }, [dispatch]);

  return children;
};

const App = () => (
  <Provider store={store}>
    <PreloadUsers>
      <AppRoutes />
    </PreloadUsers>
  </Provider>
);

export default App;
