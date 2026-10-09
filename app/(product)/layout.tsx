import type {ReactNode} from "react";

import {AuthProvider} from "@/lib/auth/auth-provider";

// Everything under this group needs Firebase: the auth pages and the signed-in app.
// The marketing site stays outside it and never initialises Firebase.
export default function ProductLayout({children}: {children: ReactNode}) {
  return <AuthProvider>{children}</AuthProvider>;
}
