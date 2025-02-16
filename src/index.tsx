import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Main } from "@/components/Main";
import { ThemeContextProvider } from "@/components/ThemeContextProvider";

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <ThemeContextProvider>
      <Main />
    </ThemeContextProvider>
  </React.StrictMode>
);
