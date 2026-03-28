import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Main } from "@/components/Main";
import {
  ThemeContextProvider,
  useTheme,
} from "@/components/ThemeContextProvider";
import { initDB } from "./misc";
import { Timer } from "@/components/Timer";

initDB();
const root = ReactDOM.createRoot(document.body);
const Favicon = () => {
  const [theme] = useTheme();
  const rels = ["icon", "apple-touch-icon"];
  const hrefs = [`/favicon-${theme}.ico`, `logo-${theme}192.png`];
  rels.forEach((rel, i) => {
    (document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement).href =
      hrefs[i];
  });
  return null;
};
root.render(
  <React.StrictMode>
    <ThemeContextProvider>
      <Favicon />
      {/* <Main /> */}
      <Timer />
    </ThemeContextProvider>
  </React.StrictMode>
);
