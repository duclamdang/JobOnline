import App from "./App.tsx";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import { store } from "@context/store";
import { Provider } from "react-redux";
import i18n from "./i18n";
import "./index.css";
import { ToastContainer } from "react-toastify";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <Provider store={store}>
        <App />
        <ToastContainer position="bottom-right" autoClose={1000} />
      </Provider>
    </I18nextProvider>
  </StrictMode>
);
