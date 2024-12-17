import { LoginMenuProps } from "./types";
import "./LoginMenu.css";
import { Button } from "@/components/Button";
import { useEffect, useRef, useState } from "react";
import { Apple, Google, Login } from "@/resources/SVG";
import { Rippleable } from "../Rippleable";
import { Divider } from "../Divider";
import { useGoogleLogin } from "@react-oauth/google";
import { generateNonce, ORIGIN, parseToken } from "@/misc";

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
        // TODO we have a problem
      }
      fetch(`${ORIGIN}/v1/auth/google`, {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        integrity: "",
        keepalive: false,
        mode: "cors",
        priority: "high",
        redirect: "error",
        referrer: window.location.href,
        referrerPolicy: "no-referrer-when-downgrade",
        signal: null,
        window: null,
        headers: {
          Accept: "application/json",
          "Content-Type": "text/plain",
        },
        body: tokenResponse.code,
      }).then(async (res) => {
        const token = await res.text();
        localStorage.setItem("google-token", token);
        const payload = parseToken(token)["payload"];
        props.setUserID(+payload.sub);
      });
    },
    onError: () => {
      console.log("Login Failed");
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
              //TODO Sign in with Google
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
              //TODO Sign in with Apple
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
