import { SettingsMenuProps } from "./types";
import "./SettingsMenu.css";
import { Button } from "@/components/Button";
import { Dark, Light, PermanentBin, Settings } from "@/resources/SVG";
import { useEffect, useRef, useState } from "react";
import { Divider } from "../Divider";
import { useTheme } from "@/misc/hooks";
import { ConfirmDeleteDialog } from "../ConfirmDeleteDialog";
import { getJWT, ORIGIN } from "@/misc";

export const SettingsMenu = (props: SettingsMenuProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useTheme();
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const settingsMenuRef = useRef<HTMLMenuElement>(null);
  const [openDialog, closeDialog, Dialog] = ConfirmDeleteDialog();

  const title = props.isLoggedIn
    ? "Permanently Delete Account?"
    : "Permanently Delete Data?";
  const subtitle = props.isLoggedIn
    ? "Performing this action will delete your account and all of your routines and workouts."
    : "Performing this action will delete all of your routines and workouts.";

  useEffect(() => {
    const onclick = (event: MouseEvent) => {
      if (!settingsMenuRef.current || !settingsButtonRef.current) return;
      const isMenuItem = settingsMenuRef.current.contains(event.target as any);
      const isMenuButton = settingsButtonRef.current === event.target;
      if (!isMenuItem && !isMenuButton) setIsMenuOpen(false);
    };
    window.addEventListener("click", onclick);

    return () => window.removeEventListener("click", onclick);
  }, []);

  return (
    <>
      <div className="settings-menu-container">
        <Button
          className="settings-button"
          ref={settingsButtonRef}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Settings />
        </Button>
        <menu
          style={{ display: isMenuOpen ? "" : "none" }}
          className="settings-menu"
          ref={settingsMenuRef}
        >
          <Button
            onClick={() => {
              setTheme(theme === "light" ? "dark" : "light");
            }}
          >
            {theme === "light" ? (
              <>
                <Dark />
                <span>Set to Dark</span>
              </>
            ) : (
              <>
                <Light />
                <span>Set to Light</span>
              </>
            )}
          </Button>
          <Divider width="90%" margin=".5rem" />
          <Button className="delete-account-menu-option" onClick={openDialog}>
            <PermanentBin />
            <span>{props.isLoggedIn ? "Delete Account" : "Clear Data"}</span>
          </Button>
        </menu>
      </div>
      <Dialog
        title={title}
        subtitle={subtitle}
        deleteAction={(event) => {
          const token = getJWT();
          if (props.isLoggedIn) {
            closeDialog(event);
            fetch(`${ORIGIN}/v1/users/${props.userID}`, {
              method: "DELETE",
              credentials: "omit",
              mode: "cors",
              integrity: "",
              keepalive: false,
              cache: "default",
              referrer: window.location.href,
              referrerPolicy: "no-referrer-when-downgrade",
              signal: null,
              window: null,
              redirect: "error",
              headers: { Authorization: `Bearer ${token}` },
            })
              .then(() => {
                localStorage.clear();
                window.location.href = window.location.origin;
              })
              .catch(() => {
                // TODO handle error [failed account deletion]
              });
          } else {
            closeDialog(event);
            localStorage.removeItem("cache");
            window.location.href = window.location.origin;
          }
        }}
      />
    </>
  );
};
