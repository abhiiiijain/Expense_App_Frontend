import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./config/chartSetup";
import Authentication from "./app/Authentication";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Authentication />
  </React.StrictMode>
);
