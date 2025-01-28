import { LoginMenuProps } from "./types";
import "./LoginMenu.css";
import { Login } from "@/resources/SVG";
import { GoogleButton } from "@/components/GoogleButton";
import { ButtonMenu } from "@/components/ButtonMenu";

export const LoginMenu = (props: LoginMenuProps) => {
  return (
    <ButtonMenu buttonIcon={<Login />}>
      <GoogleButton setUserID={props.setUserID} />
    </ButtonMenu>
  );
};
