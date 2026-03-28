import { ButtonMenuProps } from "./types";
import "./ButtonMenu.css";
import { Button } from "@/components/Button";
import { useRef, useState } from "react";
import { Close } from "@/resources/SVG";
import { Divider } from "@/components/Divider";
import { MenuIcon } from "@/components/MenuIcon";
import { useWindowEvent } from "@/misc/hooks";

export const ButtonMenu = ({
  children,
  buttonIcon,
  isLoggedIn,
}: ButtonMenuProps) => {
  const toggleMenuRef = useRef<HTMLButtonElement>(null);
  const buttonMenuRef = useRef<HTMLMenuElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useWindowEvent(
    false,
    "click",
    (event) => {
      if (!buttonMenuRef.current || !toggleMenuRef.current) return;
      const isMenuItem = buttonMenuRef.current.contains(event.target as any);
      const isMenuButton = toggleMenuRef.current === event.target;
      if (!isMenuButton && !isMenuItem) setIsMenuOpen(false);
    },
    [buttonMenuRef]
  );
  return (
    <div className="button-menu-container">
      <Button
        className="toggle-menu-button"
        ref={toggleMenuRef}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {buttonIcon}
      </Button>
      <menu
        style={{ translate: `${isMenuOpen ? 0 : 10}0% 0%` }}
        ref={buttonMenuRef}
      >
        <header>
          <MenuIcon isLoggedIn={isLoggedIn} />
          <Button onClick={() => setIsMenuOpen(false)} className="static-noise">
            <Close />
          </Button>
        </header>
        <Divider margin="0.5rem" width="calc(100% - 1rem)" />
        <article>{children}</article>
      </menu>
      {isMenuOpen && <div className="backdrop"></div>}
    </div>
  );
};
