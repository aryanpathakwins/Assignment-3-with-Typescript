import  { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import AppRoutes from "./Routes/AppRoutes"; 
import { store } from "./Redux/store";
import "./index.css";
import "antd/dist/reset.css";

const container = document.getElementById("root");

if (!container) throw new Error("Root container not found");

createRoot(container).render(
  <StrictMode>
    <Provider store={store}>
      <AppRoutes />  
    </Provider>
  </StrictMode>
);
