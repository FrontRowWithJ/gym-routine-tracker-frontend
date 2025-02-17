import { LoginMenuProps } from "./types";
import { Login, Logout, PermanentBin } from "@/resources/SVG";
import { GoogleButton } from "@/components/GoogleButton";
import { ButtonMenu } from "@/components/ButtonMenu";
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
import { ScriptContextProvider } from "@/components/ScriptContextProvider";

const getLoggedInData = (
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>,
  userID: number,
  closeDialog: (event: React.BaseSyntheticEvent) => void
) => {
  return {
    title: "Permanently Delete Account?",
    subtitle:
      "Performing this action will delete your account and all of your routines and workouts.",
    buttonIcon: (
      <img
        alt="icon"
        src={
          parseJWT<GymRoutineJWT>(localStorage.getItem("auth-token")!).payload
            .picture
        }
      />
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
      fetchWrapper(`${ORIGIN}/v1/users/${userID}`, {
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
  };
};

const getLoggedOutData = (
  closeDialog: (event: React.BaseSyntheticEvent) => void,
  setUserID: React.Dispatch<React.SetStateAction<number>>
) => {
  return {
    title: "Permanently Delete Data?",
    subtitle:
      "Performing this action will delete all of your routines and workouts.",
    buttonIcon: <Login />,
    loginLogoutText: "Clear Data",
    loginLogoutButton: (
      <ScriptContextProvider src="https://accounts.google.com/gsi/client">
        <GoogleButton setUserID={setUserID} />
      </ScriptContextProvider>
    ),
    deleteAction: (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      closeDialog(event);
      logout();
    },
  };
};
export const LoginMenu = (props: LoginMenuProps) => {
  const { isLoggedIn, userID, setUserID } = props;
  const [openDialog, closeDialog, Dialog] = ConfirmDeleteDialog();
  const [ErrorBanner, setErrorMessage] = useErrorBanner();
  const data = isLoggedIn
    ? getLoggedInData(setErrorMessage, userID, closeDialog)
    : getLoggedOutData(closeDialog, setUserID);
  const {
    buttonIcon,
    title,
    subtitle,
    loginLogoutButton,
    loginLogoutText,
    deleteAction,
  } = data;
  return (
    <>
      <ErrorBanner />
      <ButtonMenu {...{ buttonIcon, isLoggedIn }}>
        {loginLogoutButton}
        <Button onClick={openDialog}>
          <span>{loginLogoutText}</span>
          <PermanentBin />
        </Button>
      </ButtonMenu>
      <Dialog {...{ title, subtitle, deleteAction }} />
    </>
  );
};
