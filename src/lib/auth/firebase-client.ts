"use client";
import { getApps, initializeApp } from "firebase/app";
import {
  browserPopupRedirectResolver,
  initializeAuth,
  inMemoryPersistence,
} from "firebase/auth";

export function browserAuth() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  if (Object.values(config).some((value) => !value))
    throw new Error("Google sign-in is not configured.");
  const app =
    getApps().find((app) => app.name === "lotusbuild-auth") ??
    initializeApp(config, "lotusbuild-auth");
  // Google OAuth uses the official SDK. Tokens live in memory only until the
  // server establishes the HTTP-only cookie session; no localStorage persistence.
  return initializeAuth(app, {
    persistence: inMemoryPersistence,
    popupRedirectResolver: browserPopupRedirectResolver,
  });
}
