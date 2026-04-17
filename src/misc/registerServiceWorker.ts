// In production, we register a service worker to serve assets from local cache.

// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. However, it also means that developers (and users)
// will only see deployed updates on the 'N+1' visit to a page, since previously
// cached resources are updated in the background.

// To learn more about the benefits of this model, read https://goo.gl/KwvDNy.
// This link also includes instructions on opting out of this behavior.

export const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    const rej = (await navigator.serviceWorker.getRegistrations()).at(0);
    if (rej) return rej;
  }
  return new Promise<null | ServiceWorkerRegistration>((resolve, reject) => {
    if (!("serviceWorker" in navigator)) {  
      const errorMessage =
        "Registration error: navigator.serviceWorker is undefined";
      console.error(errorMessage);
      return reject(new Error(errorMessage));
    }
    // The URL constructor is available in all browsers that support SW.
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    // Our service worker won't work if PUBLIC_URL is on a different origin
    // from what our page is served on. This might happen if a CDN is used to
    // serve assets; see https://github.com/facebookincubator/create-react-app/issues/2374
    if (publicUrl.origin !== window.location.origin) {
      const errorMessage = "PUBLIC_URL is on a different origin";
      console.error(errorMessage);
      return reject(new Error(errorMessage));
    }
    const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
    if (document.readyState === "complete") {
      registerValidSW(swUrl).then((registration) => resolve(registration));
    } else {
      window.addEventListener("load", async () =>
        resolve(await registerValidSW(swUrl)),
      );
    }
  });
};

const registerValidSW = async (swUrl: string) => {
  try {
    const registration = await navigator.serviceWorker.register(swUrl);
    if (navigator.serviceWorker.controller) {
      return registration;
    }

    return new Promise<ServiceWorkerRegistration>((resolve) => {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        resolve(registration);
      });
    });
  } catch (error) {
    console.error("Registration failed: ", error);
    return null;
  }
};

export const unregister = async () => {
  if (!("serviceWorker" in navigator)) return;
  const registration = await navigator.serviceWorker.ready;
  await registration.unregister();
};
