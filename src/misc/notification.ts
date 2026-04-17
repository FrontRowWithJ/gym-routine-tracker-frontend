import { registerServiceWorker } from "./registerServiceWorker";

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  rawData.split("").forEach((c, i) => (outputArray[i] = c.charCodeAt(0)));
  return outputArray;
};

interface PushSubscriptionBody {
  endpoint: string;
  keys: { [name in PushEncryptionKeyName]: string };
  expirationTime: EpochTimeStamp | null;
}

interface ResponseBody {
  message: string;
  success: boolean;
  notificationID: string;
}

export const subscribeUserToPush = async (remainingMs: number) => {
  const permission = await Notification.requestPermission();
  if (permission === "denied") return null;
  const registration = await registerServiceWorker();
  if (!registration) return null;

  const subscribeOptions = {
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      process.env.REACT_APP_VAPID_PUBLIC_KEY!,
    ),
  };
  const existingSubscription = await registration.pushManager.getSubscription();
  const pushSubscription =
    existingSubscription ??
    (await registration.pushManager.subscribe(subscribeOptions));
  const subscription = JSON.parse(
    JSON.stringify(pushSubscription),
  ) as PushSubscriptionBody;
  try {
    const response = await fetch(process.env.REACT_APP_PUSH_SERVER_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription, remainingMs }),
    });
    const { message, success, notificationID } =
      (await response.json()) as ResponseBody;
    if (!success) {
      console.error(`Registration error: ${message}`);
      return null;
    }
    return notificationID ?? null;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const cancelPushNotification = async (notificationID: string) => {
  try {
    await fetch(`${process.env.REACT_APP_PUSH_SERVER_URL!}/${notificationID}`, {
      method: "DELETE",
    });
  } catch (err) {
    console.error(err);
  }
};
