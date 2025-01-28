type localStorageAllowedKeys = "cache" | "theme" | "auth-token";

interface Storage {
  getItem(key: "theme"): "dark" | "light" | null;
  getItem(key: Exclude<localStorageAllowedKeys, "theme">): string | null;
  setItem(key: localStorageAllowedKeys, value: string);
  removeItem(key: localStorageAllowedKeys);
}

interface ObjectConstructor {
  keys<T>(o: T): (keyof T)[];
}
