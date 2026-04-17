import { RemoveOptional } from "./types";
import { deleteRoutinesIDB } from "./storage";
import jsSHA from "jssha";

export const getYoutubeThumbnail = (youtubeID: string) =>
  youtubeID && (`https://i3.ytimg.com/vi/${youtubeID}/mqdefault.jpg` as const);

export const validateName = (value: string): string =>
  value.length > 0 ? "" : "Name can't be empty.";

export const generateRandomString = (numOfBytes: number) => {
  const randomValues = crypto.getRandomValues(new Uint8Array(numOfBytes));
  // Encode as UTF-8
  const utf8Encoder = new TextEncoder();
  const utf8Array = utf8Encoder.encode(
    String.fromCharCode.apply(null, randomValues as any),
  );
  // Base64 encode the UTF-8 data
  return btoa(String.fromCharCode.apply(null, utf8Array as any))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

export const parseJWT = <
  const JWT extends {
    header: Record<string, any>;
    payload: Record<string, any>;
    signature: string;
  },
>(
  token: string,
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
  requestInit: RemoveOptional<RequestInit, "method">,
): RequestInit => {
  const token = localStorage.getItem("Authorization");
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
    localStorage.removeItem("Authorization");
    localStorage.removeItem("cache");
    window.location.href = window.location.origin;
  });
};

export const hashString = (value: string) => {
  return new jsSHA("SHA-256", "TEXT", {
    hmacKey: { value, format: "TEXT", encoding: "UTF8" },
  }).getHash("UINT8ARRAY", { outputLen: 16 });
};

export const times = <T>(length: number, cb: (n: number) => T): T[] => {
  const result = new Array<T>(length);
  for (let i = 0; i < length; i++) {
    result[i] = cb(i);
  }
  return result;
};

export class UnitBezier {
  private ax: number;
  private bx: number;
  private cx: number;

  private ay: number;
  private by: number;
  private cy: number;

  constructor(x1: number, y1: number, x2: number, y2: number) {
    // Calculate the polynomial coefficients, implicit first and last control points are (0,0) and (1,1).
    this.cx = 3.0 * x1;
    this.bx = 3.0 * (x2 - x1) - this.cx;
    this.ax = 1.0 - this.cx - this.bx;

    this.cy = 3.0 * y1;
    this.by = 3.0 * (y2 - y1) - this.cy;
    this.ay = 1.0 - this.cy - this.by;
  }

  sampleCurveX(t: number): number {
    return ((this.ax * t + this.bx) * t + this.cx) * t;
  }

  sampleCurveY(t: number): number {
    return ((this.ay * t + this.by) * t + this.cy) * t;
  }

  sampleCurveDerivativeX(t: number): number {
    return (3.0 * this.ax * t + 2.0 * this.bx) * t + this.cx;
  }

  solveCurveX(x: number, epsilon: number): number {
    let t0: number;
    let t1: number;
    let t2: number;
    let x2: number;
    let d2: number;
    let i: number;

    // First try a few iterations of Newton's method -- normally very fast.
    for (t2 = x, i = 0; i < 8; i++) {
      x2 = this.sampleCurveX(t2) - x;
      if (Math.abs(x2) < epsilon) return t2;
      d2 = this.sampleCurveDerivativeX(t2);
      if (Math.abs(d2) < 1e-6) break;
      t2 = t2 - x2 / d2;
    }

    // Fall back to the bisection method for reliability.
    t0 = 0.0;
    t1 = 1.0;
    t2 = x;

    if (t2 < t0) return t0;
    if (t2 > t1) return t1;

    while (t0 < t1) {
      x2 = this.sampleCurveX(t2);
      if (Math.abs(x2 - x) < epsilon) return t2;
      if (x > x2) t0 = t2;
      else t1 = t2;
      t2 = (t1 - t0) * 0.5 + t0;
    }

    // Failure.
    return t2;
  }

  solve(x: number, epsilon: number): number {
    return this.sampleCurveY(this.solveCurveX(x, epsilon));
  }
}
