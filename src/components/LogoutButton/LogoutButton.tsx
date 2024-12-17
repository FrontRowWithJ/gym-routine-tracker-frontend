import { LogoutButtonProps } from "./types";
import "./LogoutButton.css";
import { Button } from "@/components/Button";
import { Logout } from "@/resources/SVG";

export const LogoutButton = (props: LogoutButtonProps) => {
  return (
    <Button
      className="logout-button"
      onClick={() => {
        // clear cache
        localStorage.clear();
        // reload to clear usestates
        window.location.href = window.location.origin;
      }}
    >
      <Logout />
    </Button>
  );
};
