import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

import {auth} from "@/lib/firebase/client";

// Firebase codes mapped to messages. Anything unmapped gets one generic message,
// so no internal detail reaches the page.
const messages: Record<string, string> = {
  "auth/invalid-credential": "Email or password is incorrect.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/weak-password": "Choose a stronger password.",
  "auth/too-many-requests": "Too many attempts. Try again later.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
};
const GENERIC_ERROR = "Something went wrong. Try again.";

// Returns the message to show, or null when the user simply closed the Google popup.
export function authErrorMessage(error: unknown): string | null {
  const code = (error as {code?: string}).code;
  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return null;
  return (code && messages[code]) ?? GENERIC_ERROR;
}

export async function signInWithEmail(email: string, password: string) {
  await signInWithEmailAndPassword(auth, email, password);
}

// Creates the account and sends the verification link. The backend requires a
// verified email before a build can start.
export async function signUpWithEmail(email: string, password: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(credential.user);
}

export async function signInWithGoogle() {
  await signInWithPopup(auth, new GoogleAuthProvider());
}
