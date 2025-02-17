import { MenuIconProps } from "./types";
import "./MenuIcon.css";
import { useTheme } from "@/components/ThemeContextProvider";
import { GymRoutineJWT, parseJWT } from "@/misc";
import { Logo } from "@/resources/SVG";

export const MenuIcon = ({ isLoggedIn }: MenuIconProps) => {
  const [theme] = useTheme();
  return isLoggedIn ? (
    <img
      className="menu-icon"
      src={
        parseJWT<GymRoutineJWT>(localStorage.getItem("auth-token")!).payload
          .picture
      }
      alt="icon"
    />
  ) : (
    <Logo theme={theme} className="menu-icon" />
  );
};
