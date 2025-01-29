export const NOOP = () => {};
export const MATCH_MEDIA_QUERY = "(prefers-color-scheme: dark)";
export const YOUTUBE_ID_LENGTH = 11;
export const ORIGIN =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3001"
    : "machrino.me";
export const OFFLINE_USER_ID = -1;
export const FIVE_MINUTES = 300;
export const DEFAULT_ERROR_MESSAGE = "Server error. Try again later.";
