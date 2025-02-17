import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Main } from "@/components/Main";
import {
  ThemeContextProvider,
  useTheme,
} from "@/components/ThemeContextProvider";

const root = ReactDOM.createRoot(document.getElementById("root")!);

const Favicon = () => {
  const [theme] = useTheme();
  const link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
  link.href = `/favicon-${theme}.ico`;
  return null;
};
root.render(
  <React.StrictMode>
    <ThemeContextProvider>
      <Favicon />
      <Main />
    </ThemeContextProvider>
  </React.StrictMode>
);
