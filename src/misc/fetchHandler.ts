import { applyDefaultRequestInitParams } from ".";
import { RemoveOptional, Replace } from "./types";

type FetchError =
  | "InvalidJSON"
  | "RequestFailed"
  | "Timeout"
  | "InvalidText"
  | "MissingAcceptType";
type AcceptType = "application/x-empty" | "application/json" | "text/plain";
const allowedAcceptTypes: { [key in AcceptType]: "" } = {
  "application/json": "",
  "application/x-empty": "",
  "text/plain": "",
};
// FEATURE add telemetry
export const fetchWrapper = <T>(
  input: RequestInfo | URL,
  {
    retries = 3,
    retryBaseDelay = 1000,
    ...init
  }: {
    retries?: number;
    retryBaseDelay?: number;
    signal?: AbortSignal | null;
  } & Replace<
    RemoveOptional<RequestInit, "method" | "headers">,
    { headers: Record<string, string> }
  >
): Promise<{ data: T; error: null } | { data: null; error: FetchError }> => {
  const execute = async (
    attempt: number
  ): Promise<{ data: T; error: null } | { data: null; error: FetchError }> => {
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 1000);
      init.signal?.addEventListener("abort", controller.abort);
      const acceptType = init.headers["Accept"] as AcceptType;
      if (!(acceptType in allowedAcceptTypes)) {
        throw new Error("MissingAcceptType");
      }
      const response = await fetch(input, applyDefaultRequestInitParams(init));
      if (!response.ok) {
        throw new Error(`Fetch error: HTTP error! Status:${response.status}`);
      }
      try {
        if (acceptType === "application/json") {
          return { data: await response.json(), error: null };
        } else if (acceptType === "text/plain") {
          return { data: (await response.text()) as T, error: null };
        }
        return { data: "" as T, error: null };
      } catch (dataError) {
        if (attempt < retries) {
          throw dataError;
        } // jump to retry
        if (acceptType === "application/json") {
          return { data: null, error: "InvalidJSON" };
        }
        return { data: null, error: "InvalidText" };
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return { data: null, error: "Timeout" };
      } else if ((error as Error).name === "MissingAcceptType") {
        return { data: null, error: "MissingAcceptType" };
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
  timeout: number,
  refresh?: F
): ((...args: Parameters<F>) => Promise<ReturnType<F>>) => {
  let timeoutID: number | undefined = undefined;
  return (...args) => {
    clearTimeout(timeoutID);
    refresh?.(...args);
    return new Promise((resolve) => {
      timeoutID = +setTimeout(() => resolve(func(...args)), timeout);
    });
  };
};
