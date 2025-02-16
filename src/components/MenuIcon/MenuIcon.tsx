import { MenuIconProps } from "./types";
import "./MenuIcon.css";
import { useTheme } from "../ThemeContextProvider";
import { lightLogo, darkLogo } from "@/resources/images";
import { GymRoutineJWT, parseJWT } from "@/misc";

export const MenuIcon = ({ isLoggedIn }: MenuIconProps) => {
  const [theme] = useTheme();
  const src = isLoggedIn
    ? parseJWT<GymRoutineJWT>(localStorage.getItem("auth-token")!).payload
        .picture
    : theme === "light"
    ? darkLogo
    : lightLogo;
  return <img className="menu-icon" src={src} alt="icon" />;
};
