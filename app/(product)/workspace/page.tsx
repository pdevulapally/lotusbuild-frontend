"use client";

import {useEffect} from "react";
import {useRouter} from "next/navigation";

import {AuthLoading, RequireAuth} from "@/components/auth/require-auth";
import type {Me} from "@/lib/api/me";
import {homePath} from "@/lib/auth/home";

function Redirect({me}: {me: Me}) {
  const router = useRouter();
  useEffect(() => router.replace(homePath(me)), [me, router]);
  return <AuthLoading label="Opening your workspace…" />;
}

// /workspace resolves to the account's own workspace route.
export default function WorkspaceIndexPage() {
  return <RequireAuth>{({me}) => <Redirect me={me} />}</RequireAuth>;
}
