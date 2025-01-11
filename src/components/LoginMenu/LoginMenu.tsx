import { LoginMenuProps } from "./types";
import "./LoginMenu.css";
import { Button } from "@/components/Button";
import { Apple, Login } from "@/resources/SVG";
import { Rippleable } from "@/components/Rippleable";
import { GoogleButton } from "@/components/GoogleButton";
import { ButtonMenu } from "@/components/ButtonMenu";

export const LoginMenu = (props: LoginMenuProps) => {
  return (
    <ButtonMenu buttonIcon={<Login />}>
      <GoogleButton setUserID={props.setUserID} />
      <Rippleable>
        <Button
          onClick={() => {
            //FEATURE Sign in with Apple
          }}
        >
          <span>Continue with Apple</span>
          <Apple />
        </Button>
      </Rippleable>
    </ButtonMenu>
  );
};
