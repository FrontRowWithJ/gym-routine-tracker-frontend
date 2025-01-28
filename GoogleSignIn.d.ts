type select_by =
  | "auto"
  | "user"
  | "fedcm"
  | "fedcm_auto"
  | "user_1tap"
  | "user_2tap"
  | "itp"
  | "itp_confirm"
  | "itp_add_session"
  | "itp_confirm_add_session"
  | "btn"
  | "btn_confirm"
  | "btn_add_session"
  | "btn_confirm_add_session";

interface CredentialResponse {
  clientId: string;
  client_id: string;
  credential: string;
  select_by: select_by;
  state?: string;
}

interface Credential {
  id: string;
  password: string;
}

interface IdConfiguration {
  client_id: `${string}.apps.googleusercontent.com`;
  auto_select?: boolean;
  callback: (credentialResponse: CredentialResponse) => void;
  login_uri?: string;
  native_callback?: (credential: Credential) => void;
  cancel_on_tap_outside?: boolean;
  prompt_parent_id?: string;
  nonce?: string;
  context?: "signin" | "signup" | "use";
  state_cookie_domain?: string;
  ux_mode?: "popup" | "redirect";
  allowed_parent_origin?: string | string[];
  intermediate_iframe_close_callback?: () => void;
  itp_support?: boolean;
  login_hint?: string;
  hd?: string;
  use_fedcm_for_prompt?: boolean;
  enable_redirect_uri_validation?: boolean;
}

type NotDisplayedReason =
  | "browser_not_supported"
  | "invalid_client"
  | "missing_client_id"
  | "opt_out_or_no_session"
  | "securehttp_required"
  | "suppressed_by_user"
  | "unregistered_origin"
  | "unkown_reason";

type SkippedReason =
  | "auto_cancel"
  | "user_cancel"
  | "tap_outside"
  | "issuing_failed";

type DismissedReason =
  | "credential_returned"
  | "cancel_called"
  | "flow_restarted";
type MomentType = "display" | "skipped" | "dismissed";

interface PromptMomentNotification {
  isDisplayMoment: () => boolean;
  isDisplayed: () => boolean;
  isNotDisplayed: () => boolean;
  getNotDisplayedReason: () => NotDisplayedReason;
  isSkippedMoment: () => boolean;
  getSkippedReason: () => SkippedReason;
  isDismissedMoment: () => boolean;
  getDismissedReason: () => DismissedReason;
  getMomentType: () => MomentType;
}

type PromptMomentNotificationListener = (
  notification: PromptMomentNotification
) => void;

interface GsiButtonConfiguration {
  type: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  width?: string;
  locale?: string;
  click_listener?: () => void;
  state?: string;
}

type RevocationResponse =
  | { successful: true; error: undefined }
  | { successful: false; error: string };

interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (options: IdConfiguration) => void;
        prompt: (momentListener?: PromptMomentNotificationListener) => void;
        renderButton: (
          parent: HTMLElement,
          options: GsiButtonConfiguration
        ) => void;
        disableAutoSelect: () => void;
        storeCredential: (
          credential: Credential,
          callback?: () => void
        ) => void;
        cancel: () => void;
        revoke: (login_hint: string, callback: RevocationResponse) => void;
      };
    };
  };
  onGoogleLibraryLoad?: () => void;
}
