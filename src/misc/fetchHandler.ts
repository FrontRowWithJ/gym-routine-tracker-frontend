import { applyDefaultRequestInitParams } from ".";
import { RemoveOptional, Replace } from "./types";

type FetchError =
  | "InvalidJSON"
  | "RequestFailed"
  | "Timeout"
  | "InvalidText"
  | "MissingAcceptType";
type AcceptType = "application/x-empty" | "application/json" | "text/plain";
const allowedAcceptTypes = new Set<AcceptType>([
  "application/json",
  "application/x-empty",
  "text/plain",
]);

type ResponseMap = {
  "application/json": unknown;
  "text/plain": string;
  "application/x-empty": undefined;
};

type FetchResult<A extends AcceptType, T extends ResponseMap[A]> =
  | { response: T; error: null }
  | { response: null; error: FetchError };

const isAcceptType = (str: unknown): str is AcceptType =>
  allowedAcceptTypes.has(str as AcceptType);

export const fetchWrapper = async <
  A extends AcceptType,
  T extends ResponseMap[A] = ResponseMap[A],
>(
  input: RequestInfo | URL,
  {
    retries = 3,
    retryBaseDelay = 1000,
    totalTimeoutMs = 5000,
    ...init
  }: {
    retries?: number;
    retryBaseDelay?: number;
    totalTimeoutMs?: number;
    signal?: AbortSignal | null;
  } & Replace<
    RemoveOptional<RequestInit, "method">,
    {
      headers: { Accept: A } & Record<string, string>;
      method: "DELETE" | "POST" | "PUT" | "GET" | "OPTIONS";
    }
  >,
): Promise<FetchResult<A, T>> => {
  const finalInit = applyDefaultRequestInitParams(init) as typeof init;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), totalTimeoutMs);
  finalInit.signal?.addEventListener("abort", () => controller.abort(), {
    once: true,
  });
  const headers = new Headers(finalInit.headers);
  const acceptType = headers.get("Accept");
  if (!isAcceptType(acceptType)) {
    return { response: null, error: "MissingAcceptType" };
  }
  const execute = async (attempt: number): Promise<FetchResult<A, T>> => {
    try {
      const response = await fetch(input, {
        ...finalInit,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("RequestFailed");
      }

      let res;
      if (acceptType === "application/json") {
        res = await response.json().catch(() => {
          throw new Error("InvalidJSON");
        });
      } else if (acceptType === "text/plain") {
        res = await response.text().catch(() => {
          throw new Error("InvalidText");
        });
      }
      return { response: res as T, error: null };
    } catch (error) {
      const { message, name } = error as Error;
      if (message === "InvalidJSON" || message === "InvalidText") {
        return { response: null, error: message };
      }
      if (name === "AbortError") {
        return { response: null, error: "Timeout" };
      }

      if (attempt < retries) {
        const delayMs = retryBaseDelay * 2 ** attempt;
        await new Promise((r) => setTimeout(r, delayMs));
        return execute(attempt + 1);
      }
      return { response: null, error: "RequestFailed" };
    }
  };
  const result = await execute(0);
  clearTimeout(timeoutId);
  return result;
};
