import { LoginMenuProps } from "./types";
import "./LoginMenu.css";
import { Button } from "@/components/Button";
import { useEffect, useRef, useState } from "react";
import { Apple, Google, Login } from "@/resources/SVG";
import { Rippleable } from "../Rippleable";
import { Divider } from "../Divider";
import { useGoogleLogin } from "@react-oauth/google";
import {
  generateNonce,
  ORIGIN,
  parseToken,
} from "@/misc";
import { fetchWrapper } from "@/misc/fetchHandler";

export const LoginMenu = (props: LoginMenuProps) => {
  const loginButtonRef = useRef<HTMLButtonElement>(null);
  const loginMenuRef = useRef<HTMLMenuElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const onclick = (event: MouseEvent) => {
      if (!loginMenuRef.current || !loginButtonRef.current) return;
      const isMenuItem = loginMenuRef.current.contains(event.target as any);
      const isMenuButton = loginButtonRef.current === event.target;
      if (!isMenuButton && !isMenuItem) setIsMenuOpen(false);
    };
    window.addEventListener("click", onclick);
    return () => window.removeEventListener("click", onclick);
  }, []);
  const nonce = generateNonce();
  const login = useGoogleLogin({
    flow: "auth-code",
    include_granted_scopes: true,
    state: nonce,

    onSuccess: (tokenResponse) => {
      if (tokenResponse.state !== nonce) {
        // TODO inform users that a deep tragedy has occured.
      } else {
        fetchWrapper(`${ORIGIN}/v1/auth/google`, {
          method: "POST",
          cache: "no-store",
          body: tokenResponse.code,
          priority: "high",
          headers: { Accept: "text/plain" },
        }).then(async ({ data: token, error }) => {
          if (error !== null) {
            // TODO handle error
          } else {
            try {
              const payload = parseToken(token as string)["payload"];
              localStorage.setItem("google-token", token as string);
              props.setUserID(+payload.sub);
            } catch (err) {
              // TODO handle unauthorized error
            }
          }
        });
      }
    },
    onError: () => {
      // TODO handle error
    },
  });

  return (
    <div className="login-menu-container">
      <Button
        className="login-button"
        ref={loginButtonRef}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <Login />
      </Button>
      <menu
        style={{ display: isMenuOpen ? "" : "none" }}
        className="login-menu"
        ref={loginMenuRef}
      >
        <Rippleable>
          <Button
            className="sign-in"
            onClick={() => {
              login();
            }}
          >
            <Google />
            <span>Continue with Google</span>
          </Button>
        </Rippleable>
        <Divider width="90%" margin=".5rem" />
        <Rippleable>
          <Button
            className="sign-in"
            onClick={() => {
              //FEATURE Sign in with Apple
            }}
          >
            <Apple />
            <span>Continue with Apple</span>
          </Button>
        </Rippleable>
      </menu>
    </div>
  );
};
