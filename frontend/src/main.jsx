import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import axios from "axios";
import GlobalMessageProvider from "./context/GlobalMessageProvider.jsx";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;
axios.defaults.withCredentials = true;

createRoot(document.getElementById("root")).render(
  <GlobalMessageProvider>
    <App />
  </GlobalMessageProvider>
);
