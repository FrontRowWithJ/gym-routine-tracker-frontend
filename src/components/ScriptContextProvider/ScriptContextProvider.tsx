import { ScriptContextProviderProps } from "./types";
import { createContext, useState, useEffect } from "react";

function useLoadScript(src: string): boolean {
  const [isScriptLoaded, setScriptState] = useState(false);
  useEffect(() => {
    const script = document.createElement("script");
    script.onload = () => setScriptState(true);
    script.onerror = () => setScriptState(false);
    script.src = src;
    script.async = script.defer = true;
    document.body.appendChild(script);
    return () => void document.body.removeChild(script);
  }, []);
  return isScriptLoaded;
}
export const ScriptContextProvider = (props: ScriptContextProviderProps) => {
  const ScriptContext = createContext<boolean>(false);
  const isScriptLoaded = useLoadScript(props.src);
  return (
    <ScriptContext.Provider value={isScriptLoaded}>
      {props.children}
    </ScriptContext.Provider>
  );
};
