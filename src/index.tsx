import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Main } from "@/components/Main";

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <GoogleOAuthProvider clientId="967827539022-cnpgoc9l73kqe3106ko0m7tc7cgnq4rj.apps.googleusercontent.com">
    <React.StrictMode>
      <Main />
    </React.StrictMode>
  </GoogleOAuthProvider>
);
