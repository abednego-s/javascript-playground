import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./global.css"
import "./style.css"

const domNode = document.getElementById("root");
const root = createRoot(domNode);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);