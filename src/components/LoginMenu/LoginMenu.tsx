import { LoginMenuProps } from "./types";
import "./LoginMenu.css";
import { Login, Logout, PermanentBin } from "@/resources/SVG";
import { GoogleButton } from "@/components/GoogleButton";
import { ButtonMenu } from "@/components/ButtonMenu";
import { ScriptContextProvider } from "../ScriptContextProvider";
import {
  GymRoutineJWT,
  logout,
  parseJWT,
  fetchWrapper,
  ORIGIN,
  DEFAULT_ERROR_MESSAGE,
} from "@/misc";
import { Button } from "@/components/Button";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { useErrorBanner } from "@/components/ErrorBanner";

export const LoginMenu = (props: LoginMenuProps) => {
  const {
    buttonIcon,
    title,
    subtitle,
    loginLogoutButton,
    loginLogoutText,
    deleteAction,
  } = props.isLoggedIn
    ? {
        title: "Permanently Delete Account?",
        subtitle:
          "Performing this action will delete your account and all of your routines and workouts.",
        buttonIcon: (
          <img
            alt="icon"
            src={
              parseJWT<GymRoutineJWT>(localStorage.getItem("auth-token")!)
                .payload.picture
            }
          ></img>
        ),
        loginLogoutText: "Delete Account",
        loginLogoutButton: (
          <Button onClick={logout}>
            <span>Logout</span>
            <Logout />
          </Button>
        ),
        deleteAction: (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
          const token = localStorage.getItem("auth-token");
          fetchWrapper(`${ORIGIN}/v1/users/${props.userID}`, {
            method: "DELETE",
            headers: {
              Accept: "application/x-empty",
              Authorization: `Bearer ${token}`,
            },
          }).then(({ error }) => {
            if (error != null) {
              console.error(error);
              setErrorMessage(DEFAULT_ERROR_MESSAGE);
            } else {
              closeDialog(event);
              logout();
            }
          });
        },
      }
    : {
        title: "Permanently Delete Data?",
        subtitle:
          "Performing this action will delete all of your routines and workouts.",
        buttonIcon: <Login />,
        loginLogoutText: "Clear Data",
        loginLogoutButton: (
          <ScriptContextProvider src="https://accounts.google.com/gsi/client">
            <GoogleButton setUserID={props.setUserID} />
          </ScriptContextProvider>
        ),
        deleteAction: (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
          closeDialog(event);
          logout();
        },
      };
  const [openDialog, closeDialog, Dialog] = ConfirmDeleteDialog();
  const [ErrorBanner, setErrorMessage] = useErrorBanner();
  return (
    <>
      <ErrorBanner />
      <ButtonMenu buttonIcon={buttonIcon}>
        {loginLogoutButton}
        <Button onClick={openDialog} className="foo">
          <span>{loginLogoutText}</span>
          <PermanentBin />
        </Button>
      </ButtonMenu>
      <Dialog {...{ title, subtitle, deleteAction }} />
    </>
  );
};
