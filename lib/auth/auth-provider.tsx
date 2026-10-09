"use client";

import {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode} from "react";
import {onIdTokenChanged, signOut, type User} from "firebase/auth";

import {ApiError} from "@/lib/api/client";
import {getMe, type Me} from "@/lib/api/me";
import {auth} from "@/lib/firebase/client";

import {AUTH_HINT_COOKIE} from "./cookie";
import {classifyAuthError, type AuthProblem} from "./problems";

export type AuthState =
  | {status: "loading"}
  | {status: "signed-out"; notice: string | null}
  | {status: "signed-in"; user: User; me: Me | null; problem: AuthProblem | null};

type AuthContextValue = {
  state: AuthState;
  /** Calls the API with the current ID token. A 401 is retried once with a forced refresh; a second 401 signs the user out. */
  withToken<T>(call: (token: string) => Promise<T>): Promise<T>;
  /** Re-reads the Firebase user and the account record, e.g. after the email was verified. */
  refreshAccount(): Promise<Me | null>;
  signOutUser(notice?: string): Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function writeHintCookie(signedIn: boolean) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = signedIn
    ? `${AUTH_HINT_COOKIE}=1; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 14}${secure}`
    : `${AUTH_HINT_COOKIE}=; Path=/; SameSite=Lax; Max-Age=0${secure}`;
}

export function AuthProvider({children}: {children: ReactNode}) {
  const [state, setState] = useState<AuthState>({status: "loading"});
  const loadedUid = useRef<string | null>(null);
  const pendingNotice = useRef<string | null>(null);

  const signOutUser = useCallback(async (notice?: string) => {
    pendingNotice.current = notice ?? null;
    loadedUid.current = null;
    writeHintCookie(false);
    await signOut(auth);
  }, []);

  const withToken = useCallback(
    async <T,>(call: (token: string) => Promise<T>): Promise<T> => {
      const user = auth.currentUser;
      if (!user) throw new ApiError(401, "auth/missing-token", "Not signed in.");
      try {
        return await call(await user.getIdToken());
      } catch (error) {
        if (!(error instanceof ApiError)) throw error;
        if (error.status === 401) {
          try {
            return await call(await user.getIdToken(true));
          } catch (retryError) {
            if (retryError instanceof ApiError && retryError.status === 401) {
              const problem = classifyAuthError(retryError);
              await signOutUser(problem.kind === "signed-out" ? problem.message : undefined);
            }
            throw retryError;
          }
        }
        const problem = classifyAuthError(error);
        if (problem.kind === "blocked") await signOutUser(problem.message);
        if (problem.kind === "verify-email") {
          setState(current => (current.status === "signed-in" ? {...current, problem} : current));
        }
        throw error;
      }
    },
    [signOutUser],
  );

  const loadAccount = useCallback(
    async (user: User) => {
      loadedUid.current = user.uid;
      setState({status: "signed-in", user, me: null, problem: null});
      try {
        const me = await withToken(getMe);
        setState(current =>
          current.status === "signed-in" && current.user.uid === user.uid ? {...current, me, problem: null} : current,
        );
        return me;
      } catch (error) {
        const problem = classifyAuthError(error);
        if (problem.kind === "signed-out") await signOutUser(problem.message);
        else setState(current => (current.status === "signed-in" ? {...current, problem} : current));
        return null;
      }
    },
    [signOutUser, withToken],
  );

  useEffect(
    () =>
      onIdTokenChanged(auth, user => {
        writeHintCookie(user !== null);
        if (!user) {
          loadedUid.current = null;
          setState({status: "signed-out", notice: pendingNotice.current});
          pendingNotice.current = null;
          return;
        }
        // Token refreshes also fire this listener; the account is only re-read for a new user.
        if (loadedUid.current !== user.uid) void loadAccount(user);
      }),
    [loadAccount],
  );

  const refreshAccount = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return null;
    await user.reload();
    await user.getIdToken(true);
    return loadAccount(user);
  }, [loadAccount]);

  const value = useMemo<AuthContextValue>(
    () => ({state, withToken, refreshAccount, signOutUser}),
    [state, withToken, refreshAccount, signOutUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
