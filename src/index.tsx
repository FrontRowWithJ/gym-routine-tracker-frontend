import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Main } from "@/components/Main";
import {
  ThemeContextProvider,
  useTheme,
} from "@/components/ThemeContextProvider";
import { initDB } from "./misc";

initDB();
const root = ReactDOM.createRoot(document.body);
const Favicon = () => {
  const [theme] = useTheme();
  const data = [
    { rel: "icon", href: `/favicon-${theme}.ico` },
    { rel: "apple-touch-icon", href: `logo-${theme}192.png` },
  ];
  data.forEach(({ rel, href }) => {
    (document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement).href =
      href;
  });
  return null;
};

root.render(
  <React.StrictMode>
    <ThemeContextProvider>
      <Favicon />
      <Main />
    </ThemeContextProvider>
  </React.StrictMode>,
);
