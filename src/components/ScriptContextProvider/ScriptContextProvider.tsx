import { ScriptContextProviderProps } from "./types";
import { createContext, useEffect, useState } from "react";

export const ScriptContextProvider = (props: ScriptContextProviderProps) => {
  const ScriptContext = createContext(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setIsScriptLoaded] = useState(false);
  useEffect(() => {
    const script = document.createElement("script");
    script.src = props.src;
    script.addEventListener("error", () => setIsScriptLoaded(false));
    script.addEventListener("load", () => setIsScriptLoaded(true));
    script.async = script.defer = true;
    document.body.appendChild(script);
    return () => {
      setIsScriptLoaded(false);
      document.body.removeChild(script);
    };
  }, [props.src]);

  return (
    <ScriptContext.Provider value={true}>
      {props.children}
    </ScriptContext.Provider>
  );
};
