import { LogoutMenuProps } from "./types";
import "./LogoutMenu.css";
import { Button } from "@/components/Button";
import { ButtonMenu } from "@/components/ButtonMenu";
import { GymRoutineJWT, parseJWT } from "@/misc";
import { Logout } from "@/resources/SVG";

export const LogoutMenu = (props: LogoutMenuProps) => {
  const preferredUsername = parseJWT<GymRoutineJWT>(
    localStorage.getItem("auth-token")!
  ).payload.preferred_username;
  return (
    <ButtonMenu buttonIcon={preferredUsername}>
      <Button
        className="logout-button"
        onClick={() => {
          // clear cache
          localStorage.clear();
          // reload to clear usestates
          window.location.href = window.location.origin;
        }}
      >
        <span>Logout</span>
        <Logout />
      </Button>
    </ButtonMenu>
  );
};
