import {getApp, getApps, initializeApp} from "firebase/app";
import {getAuth} from "firebase/auth";

// Each variable is read by its literal name so Next.js inlines it into the bundle.
// A missing value throws here; there is no fallback configuration.
function requireValue(name: string, value: string | undefined): string {
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

const app = getApps().length
  ? getApp()
  : initializeApp({
      apiKey: requireValue("NEXT_PUBLIC_FIREBASE_API_KEY", process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
      authDomain: requireValue("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
      projectId: requireValue("NEXT_PUBLIC_FIREBASE_PROJECT_ID", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
      appId: requireValue("NEXT_PUBLIC_FIREBASE_APP_ID", process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
    });

export const auth = getAuth(app);
