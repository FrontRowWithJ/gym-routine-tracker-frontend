import { useLoadScript } from "@/misc/hooks";
import { ScriptContextProviderProps } from "./types";
import { createContext } from "react";

export const ScriptContextProvider = (props: ScriptContextProviderProps) => {
  const ScriptContext = createContext<boolean>(false);
  const isScriptLoaded = useLoadScript(props.src);
  return (
    <ScriptContext.Provider value={isScriptLoaded}>
      {props.children}
    </ScriptContext.Provider>
  );
};
