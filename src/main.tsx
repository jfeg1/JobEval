import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "@/shared/components/ui";
import config from "devextreme/core/config";
import { licenseKey } from "./devextreme-license";
import "./app/styles/index.css";
import App from "./app/App.tsx";

// Configure DevExtreme license
config({ licenseKey });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <App />
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
);
