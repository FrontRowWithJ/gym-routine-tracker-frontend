import { RemoveOptional } from "./types";
import { OFFLINE_USER_ID } from "./constants";
import { deleteRoutinesIDB } from "./storage";
import jsSHA from "jssha";

export const getYoutubeThumbnail = (youtubeID: string) => {
  if (youtubeID === "") return "" as const;
  return `https://i3.ytimg.com/vi/${youtubeID}/mqdefault.jpg` as const;
};

export const validateName = (value: string): string =>
  value.length > 0 ? "" : "Name can't be empty.";

export const generateRandomString = (numOfBytes: number) => {
  const randomValues = crypto.getRandomValues(new Uint8Array(numOfBytes));
  // Encode as UTF-8
  const utf8Encoder = new TextEncoder();
  const utf8Array = utf8Encoder.encode(
    String.fromCharCode.apply(null, randomValues as any)
  );
  // Base64 encode the UTF-8 data
  return btoa(String.fromCharCode.apply(null, utf8Array as any))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

// if the user is offline then the ID number should be -1
export const isUserLoggedIn = (userID: number) => userID !== OFFLINE_USER_ID;

export const parseJWT = <
  const JWT extends {
    header: Record<string, any>;
    payload: Record<string, any>;
    signature: string;
  }
>(
  token: string
): JWT => {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid token");
  const [header, payload, signature] = parts;
  try {
    return {
      header: JSON.parse(window.atob(header)),
      payload: JSON.parse(window.atob(payload)),
      signature,
    } as JWT;
  } catch {
    throw new Error("Invalid token");
  }
};

export const applyDefaultRequestInitParams = (
  requestInit: RemoveOptional<RequestInit, "method">
): RequestInit => {
  const token = localStorage.getItem("auth-token");
  const { headers, ...rest } = requestInit;
  return {
    credentials: "include",
    mode: "cors",
    integrity: "",
    keepalive: false,
    cache: "default",
    referrer: window.location.href,
    referrerPolicy: "no-referrer-when-downgrade",
    window: null,
    redirect: "error",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token !== null && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    ...rest,
  };
};

export const logout = () => {
  deleteRoutinesIDB().then(() => {
    localStorage.removeItem("auth-token");
    localStorage.removeItem("cache");
    window.location.href = window.location.origin;
  });
};

export const animateBackground = (
  direction: "forwards" | "reverse" = "forwards"
) => {
  const controller = new AbortController();
  const classNames = ["domain-expansion", `animate-${direction}`];
  document.body.addEventListener(
    "animationend",
    () => {
      document.body.classList.remove(...classNames);
      controller.abort();
    },
    { signal: controller.signal }
  );
  document.body.classList.add(...classNames);
};

export const hashString = (value: string) => {
  return new jsSHA("SHA-256", "TEXT", {
    hmacKey: { value, format: "TEXT", encoding: "UTF8" },
  }).getHash("UINT8ARRAY", { outputLen: 16 });
};
