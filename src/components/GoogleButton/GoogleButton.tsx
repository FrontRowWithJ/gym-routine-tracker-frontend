import { GoogleButtonProps } from "./types";
import {
  generateRandomString,
  GoogleAuthJWT,
  GymRoutineJWT,
  ORIGIN,
  parseJWT,
} from "@/misc";
import { useEffect, useRef } from "react";
import { fetchWrapper } from "@/misc/fetchHandler";
import { useErrorBanner } from "@/components/ErrorBanner";

const FIVE_MINUTES = 300;

export const GoogleButton = ({ setUserID }: GoogleButtonProps) => {
  const [ErrorBanner, setErrorMessage] = useErrorBanner();
  const buttonRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
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
          const fiveMinutesUTCString = new Date(
            Date.now() + FIVE_MINUTES
          ).toUTCString();
          const cookieAttributes = `Domain=${window.location.hostname}; Expires=${fiveMinutesUTCString}; Max-age=${FIVE_MINUTES}; Path=/v1/auth/google; secure; Samesite=strict; Secure`;
          document.cookie = `g_csrf_token=${g_csrf_token}; ${cookieAttributes}`;
          fetchWrapper(`${ORIGIN}/v1/auth/google`, {
            method: "POST",
            cache: "default",
            credentials: "include",
            body: JSON.stringify({ g_csrf_token, credential, select_by }),
            headers: {
              Accept: "text/plain",
              "Content-Type": "application/json",
              Cookie: `g_csrf_token=${g_csrf_token}; ${cookieAttributes}`,
            },
          }).then(({ data: token, error }) => {
            if (error === null) {
              try {
                const payload = parseJWT<GymRoutineJWT>(
                  token as string
                ).payload;
                localStorage.setItem("auth-token", token as string);
                setUserID(+payload.sub);
              } catch (err) {
                console.error(err);
                setErrorMessage("Unauthorized access. Try again later.");
              }
            } else {
              console.error(error);
              setErrorMessage("Server error. Try again later.");
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
    window.google?.accounts.id.renderButton(buttonRef.current!, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "rectangular",
      logo_alignment: "left",
    });
  }, [setUserID, setErrorMessage]);
  return (
    <>
      <ErrorBanner />
      <div
        ref={buttonRef}
        style={{ width: "calc(100% - 1rem)", height: "3rem" }}
      />
    </>
  );
};
