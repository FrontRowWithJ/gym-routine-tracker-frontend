import { ButtonMenuProps } from "./types";
import "./ButtonMenu.css";
import { Button } from "@/components/Button";
import React, { useEffect, useRef, useState } from "react";
import { Divider } from "@/components/Divider";

export const ButtonMenu = (props: ButtonMenuProps) => {
  const toggleMenuRef = useRef<HTMLButtonElement>(null);
  const buttonMenuRef = useRef<HTMLMenuElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const onclick = (event: MouseEvent) => {
      if (!buttonMenuRef.current || !toggleMenuRef.current) return;
      const isMenuItem = buttonMenuRef.current.contains(event.target as any);
      const isMenuButton = toggleMenuRef.current === event.target;
      if (!isMenuButton && !isMenuItem) setIsMenuOpen(false);
    };
    window.addEventListener("click", onclick);
    return () => window.removeEventListener("click", onclick);
  }, [buttonMenuRef]);

  return (
    <div className="button-menu-container">
      <Button
        className="toggle-menu-button"
        ref={toggleMenuRef}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {props.buttonIcon}
      </Button>
      <menu
        style={{ display: isMenuOpen ? "" : "none" }}
        className="button-menu"
        ref={buttonMenuRef}
      >
        {React.Children.map(props.children, (child: any, index) => {
          return (
            <>
              {child}
              {index < React.Children.count(props.children) - 1 && (
                <Divider width="90%" margin=".5rem" />
              )}
            </>
          );
        })}
      </menu>
    </div>
  );
};
