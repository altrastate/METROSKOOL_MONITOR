import { brandCopy } from "@metroskool/brand";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Metroskool Monitor desktop root element is missing.");
}

createRoot(root).render(
  <StrictMode>
    <App companyLine={brandCopy.companyLine} />
  </StrictMode>,
);
