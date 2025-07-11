import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import Providers from "./providers";
import "leaflet/dist/leaflet.css";

createRoot(document.getElementById("root")!).render(
  <Providers>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Providers>
);
