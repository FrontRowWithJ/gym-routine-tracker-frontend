import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Main } from "@/components/Main";
import { ScriptContextProvider } from "@/components/ScriptContextProvider";

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <ScriptContextProvider src="https://accounts.google.com/gsi/client">
      <Main />
    </ScriptContextProvider>
  </React.StrictMode>
);
