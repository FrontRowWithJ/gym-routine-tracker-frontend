import "./GoogleButton.css";
import { GoogleButtonProps } from "./types";
import {
  generateRandomString,
  GoogleAuthJWT,
  GymRoutineJWT,
  loadScript,
  ORIGIN,
  parseJWT,
} from "@/misc";
import { useEffect, useRef } from "react";
import { fetchWrapper } from "@/misc/fetchHandler";

export const GoogleButton = ({ setUserID }: GoogleButtonProps) => {
  const isScriptLoadedRef = useRef(false);
  useEffect(() => {
    if (isScriptLoadedRef.current) return;
    window.onGoogleLibraryLoad = () => {
      isScriptLoadedRef.current = true;
      const nonce = generateRandomString(16);
      window.google?.accounts.id.initialize({
        client_id:
          "967827539022-cnpgoc9l73kqe3106ko0m7tc7cgnq4rj.apps.googleusercontent.com",
        callback: ({ select_by, credential }) => {
          const token = parseJWT<GoogleAuthJWT>(credential);
          if (token.payload.nonce !== nonce) {
            // alert user of potential CSRF attack
            console.log("Ooops CSRF attack!");
          } else {
            const g_csrf_token = generateRandomString(16);
            document.cookie = `g_csrf_token=${g_csrf_token}; path=/v1/auth/google; secure; samesite=strict`;
            fetchWrapper(`${ORIGIN}/v1/auth/google`, {
              method: "POST",
              cache: "default",
              credentials: "include",
              body: JSON.stringify({ g_csrf_token, credential, select_by }),
              headers: {
                Accept: "text/plain",
                "Content-Type": "application/json",
                Cookie: `g_csrf_token=${g_csrf_token}; path=/v1/auth/google; secure; samesite=strict`,
              },
            }).then(({ data: token, error }) => {
              if (error !== null) {
                console.error(error);
                // TODO handle error [failed to acquire login token]
              } else {
                try {
                  const payload = parseJWT<GymRoutineJWT>(
                    token as string
                  ).payload;
                  localStorage.setItem("google-token", token as string);
                  setUserID(+payload.sub);
                } catch (err) {
                  console.error(err);
                  // TODO handle error [unauthorized login]
                }
              }
            });
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
        nonce,
        context: "use",
        ux_mode: "popup",
        itp_support: true,
        use_fedcm_for_prompt: false,
        enable_redirect_uri_validation: true,
      });
      window.google?.accounts.id.prompt();
    };
    console.log("loading script");
    loadScript("https://accounts.google.com/gsi/client");
  }, [setUserID]);
  return (
    <div
      className="g_id_signin"
      data-type="standard"
      data-theme="outline"
      data-size="large"
      data-text="continue_with"
      data-shape="rectangular"
      data-logo_alignment="left"
    ></div>
  );
};
