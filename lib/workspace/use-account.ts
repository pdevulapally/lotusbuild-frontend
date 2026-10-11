"use client";

import {useEffect, useState} from "react";
import {onAuthStateChanged, type User} from "firebase/auth";

import {getMe, type Me} from "@/lib/api/me";
import {auth} from "@/lib/firebase/client";
import {usernameSlug} from "./slug";

export type WorkspaceAccount =
  | {status: "loading"}
  | {status: "signed-out"}
  | {status: "error"; message: string}
  | {status: "ready"; user: User; me: Me; username: string};

// Single source of truth for "who is this, and what does their account look
// like" — the Firebase auth state plus the backend's /me, resolved together.
// Every page that needs the signed-in account reads this instead of each
// re-subscribing to auth state and re-fetching /me on its own.
export function useWorkspaceAccount(): WorkspaceAccount {
  const [state, setState] = useState<WorkspaceAccount>({status: "loading"});

  useEffect(
    () =>
      onAuthStateChanged(auth, async user => {
        if (!user) {
          setState({status: "signed-out"});
          return;
        }
        try {
          const me = await getMe(await user.getIdToken());
          setState({status: "ready", user, me, username: usernameSlug(me.displayName, me.uid)});
        } catch {
          setState({status: "error", message: "Could not load your account. Refresh the page to try again."});
        }
      }),
    [],
  );

  return state;
}
