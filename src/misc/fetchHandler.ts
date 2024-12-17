import { RemoveOptional } from "./types";

type FetchError = "InvalidJSON" | "RequestFailed" | "Timeout" | "InvalidText";
type responseType = "JSON" | "text" | "none";

const applyDefaultRequestInitParams = (
  requestInit: RemoveOptional<RequestInit, "method">
): RequestInit => {
  const token =
    localStorage.getItem("google-token") ?? localStorage.getItem("apple-token");
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
      Authorization: `Bearer ${token}`,
    },
    ...requestInit,
  };
};

// TODO add telemetry
export const fetchWrapper = <T>(
  input: RequestInfo | URL,
  {
    retries = 3,
    retryBaseDelay = 1000,
    responseType = "JSON",
    ...init
  }: {
    retries?: number;
    retryBaseDelay?: number;
    responseType: responseType;
    signal?: AbortSignal | null;
  } & RemoveOptional<RequestInit, "method">
): Promise<{ data: T; error: null } | { data: null; error: FetchError }> => {
  const execute = async (
    attempt: number
  ): Promise<{ data: T; error: null } | { data: null; error: FetchError }> => {
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 1000);
      init.signal?.addEventListener("abort", controller.abort);
      const response = await fetch(input, applyDefaultRequestInitParams(init));
      if (!response.ok) {
        throw new Error(`Fetch error: HTTP error! Status:${response.status}`);
      }
      try {
        if (responseType === "JSON")
          return { data: await response.json(), error: null };
        if (responseType === "text")
          return { data: (await response.text()) as T, error: null };
        return { data: "" as T, error: null };
      } catch (dataError) {
        if (attempt < retries) throw dataError; // jump to retry
        if (responseType === "JSON")
          return { data: null, error: "InvalidJSON" };
        return { data: null, error: "InvalidText" };
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return { data: null, error: "Timeout" };
      } else if (attempt < retries) {
        const delayMs = retryBaseDelay * 2 ** attempt;
        return new Promise((resolve) =>
          setTimeout(() => resolve(execute(attempt + 1)), delayMs)
        );
      }
      return { data: null, error: "RequestFailed" };
    }
  };
  return execute(0);
};

export const debounce = <F extends (...args: any) => any>(
  func: F,
  timeout: number
): ((...args: Parameters<F>) => Promise<ReturnType<F>>) => {
  let timeoutID: number | undefined = undefined;
  return (...args) => {
    clearTimeout(timeoutID);
    return new Promise((resolve) => {
      timeoutID = +setTimeout(() => resolve(func(...args)), timeout);
    });
  };
};
