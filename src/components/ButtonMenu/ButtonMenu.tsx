import { ButtonMenuProps } from "./types";
import "./ButtonMenu.css";
import { Button } from "@/components/Button";
import { useEffect, useRef, useState, Children, cloneElement } from "react";
import { Close } from "@/resources/SVG";
import { CLOSE } from "@/misc";
import { Divider } from "@/components/Divider";
import { MenuIcon } from "@/components/MenuIcon";

export const ButtonMenu = ({
  children,
  buttonIcon,
  isLoggedIn,
}: ButtonMenuProps) => {
  const toggleMenuRef = useRef<HTMLButtonElement>(null);
  const buttonMenuRef = useRef<HTMLMenuElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(CLOSE);

  useEffect(() => {
    const controller = new AbortController();
    window.addEventListener(
      "click",
      (event) => {
        if (!buttonMenuRef.current || !toggleMenuRef.current) return;
        const isMenuItem = buttonMenuRef.current.contains(event.target as any);
        const isMenuButton = toggleMenuRef.current === event.target;
        if (!isMenuButton && !isMenuItem) setIsMenuOpen(CLOSE);
      },
      { signal: controller.signal }
    );
    return () => controller.abort();
  }, [buttonMenuRef]);
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
          <Button onClick={() => setIsMenuOpen(CLOSE)} className="static-noise">
            <Close />
          </Button>
        </header>
        <Divider margin="0.5rem" width="calc(100% - 1rem)" />
        <article>
          {Children.map(children, (child) => {
            const className = (child as any)?.props?.className ?? "";
            return cloneElement(
              child as React.ReactElement<HTMLButtonElement>,
              {
                className: `${className} static-noise`,
              }
            );
          })}
        </article>
      </menu>
      {isMenuOpen && <div className="backdrop"></div>}
    </div>
  );
};
