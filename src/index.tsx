import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { HomePage } from './components/HomePage';
import reportWebVitals from './reportWebVitals';
import { GoogleOAuthProvider } from "@react-oauth/google";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <GoogleOAuthProvider clientId="967827539022-cnpgoc9l73kqe3106ko0m7tc7cgnq4rj.apps.googleusercontent.com">
  <React.StrictMode>
    <HomePage />
  </React.StrictMode>
  </GoogleOAuthProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
