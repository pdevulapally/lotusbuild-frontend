import {getApp, getApps, initializeApp} from "firebase/app";
import {getAuth, type Auth} from "firebase/auth";

// Each variable is read by its literal name so Next.js inlines it into the bundle.
// A missing value throws here; there is no fallback configuration.
function requireValue(name: string, value: string | undefined): string {
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

let instance: Auth | null = null;

// Initialised on first use rather than at import, so prefetching a product route
// from the marketing page never evaluates (or fails on) the Firebase configuration.
export function firebaseAuth(): Auth {
  if (instance) return instance;
  const app = getApps().length
    ? getApp()
    : initializeApp({
        apiKey: requireValue("NEXT_PUBLIC_FIREBASE_API_KEY", process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
        authDomain: requireValue("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
        projectId: requireValue("NEXT_PUBLIC_FIREBASE_PROJECT_ID", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
        appId: requireValue("NEXT_PUBLIC_FIREBASE_APP_ID", process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
      });
  instance = getAuth(app);
  return instance;
}
