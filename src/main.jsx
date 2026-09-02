import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Authentication from "./app/Authentication";
import { setupPwa } from "./pwa";

setupPwa();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Authentication />
  </React.StrictMode>
);
