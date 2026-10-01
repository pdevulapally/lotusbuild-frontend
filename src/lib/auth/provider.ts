import {
  AuthError,
  object,
  parseAccount,
  parseTokens,
  unavailable,
} from "./contracts.ts";

export function createProvider(
  apiKey: string,
  apiUrl: URL,
  fetcher: typeof fetch = fetch,
) {
  async function request(url: URL, init: RequestInit) {
    let response: Response;
    try {
      response = await fetcher(url, {
        ...init,
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(10000),
      });
    } catch {
      unavailable();
    }
    let data: unknown;
    try {
      data = await response.json();
    } catch {
      unavailable();
    }
    if (!response.ok) {
      const rawCode =
        object(data) && object(data.error)
          ? (data.error.code ?? data.error.message)
          : undefined;
      const code = typeof rawCode === "string" ? rawCode.split(" : ")[0] : "";
      if (response.status === 429 || code === "TOO_MANY_ATTEMPTS_TRY_LATER")
        throw new AuthError(
          "rate-limited",
          "Too many attempts. Please try again later.",
          429,
        );
      if (response.status >= 500) unavailable();
      if (
        url.hostname === "identitytoolkit.googleapis.com" ||
        url.hostname === "securetoken.googleapis.com"
      ) {
        // Identity Toolkit uses a numeric error.code and a symbolic error.message.
        const message =
          object(data) &&
          object(data.error) &&
          typeof data.error.message === "string"
            ? data.error.message.split(" : ")[0]
            : "";
        if (message === "TOO_MANY_ATTEMPTS_TRY_LATER")
          throw new AuthError(
            "rate-limited",
            "Too many attempts. Please try again later.",
            429,
          );
        if (
          [
            "EMAIL_NOT_FOUND",
            "INVALID_PASSWORD",
            "INVALID_LOGIN_CREDENTIALS",
            "EMAIL_EXISTS",
            "USER_DISABLED",
          ].includes(message)
        )
          throw new AuthError(
            "credentials-rejected",
            "Unable to continue with those details. Check them, sign in, or reset your password.",
            401,
          );
        if (
          [
            "INVALID_REFRESH_TOKEN",
            "TOKEN_EXPIRED",
            "USER_NOT_FOUND",
            "INVALID_ID_TOKEN",
            "CREDENTIAL_TOO_OLD_LOGIN_AGAIN",
          ].includes(message)
        )
          throw new AuthError(
            "session-expired",
            "Your session has ended. Please sign in again.",
            401,
          );
        if (
          message === "WEAK_PASSWORD" ||
          message === "PASSWORD_DOES_NOT_MEET_REQUIREMENTS"
        )
          throw new AuthError(
            "weak-password",
            "Choose a stronger password that meets the account requirements.",
          );
        unavailable();
      }
      if (response.status === 401)
        throw new AuthError(
          code === "auth/token-expired" ? "token-expired" : "session-expired",
          "Your session has ended. Please sign in again.",
          401,
        );
      if (response.status === 403)
        throw new AuthError(
          "access-denied",
          "This account cannot access the workspace. Please contact your account administrator.",
          403,
        );
      unavailable();
    }
    return data;
  }
  function identity(method: string, body: object) {
    const url = new URL(
      `https://identitytoolkit.googleapis.com/v1/accounts:${method}`,
    );
    url.searchParams.set("key", apiKey);
    return request(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }
  return {
    async google(idToken: string, origin: string) {
      return parseTokens(
        await identity("signInWithIdp", {
          postBody: new URLSearchParams({
            id_token: idToken,
            providerId: "google.com",
          }).toString(),
          requestUri: origin,
          returnSecureToken: true,
        }),
      );
    },
    async authenticate(email: string, password: string, signup: boolean) {
      return parseTokens(
        await identity(signup ? "signUp" : "signInWithPassword", {
          email,
          password,
          returnSecureToken: true,
        }),
      );
    },
    async refresh(refreshToken: string) {
      const url = new URL("https://securetoken.googleapis.com/v1/token");
      url.searchParams.set("key", apiKey);
      return parseTokens(
        await request(url, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
          }).toString(),
        }),
        true,
      );
    },
    async account(token: string) {
      return parseAccount(
        await request(new URL(`${apiUrl.toString().replace(/\/$/, "")}/me`), {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
    },
    async verifyEmail(token: string) {
      await identity("sendOobCode", {
        requestType: "VERIFY_EMAIL",
        idToken: token,
      });
    },
    async resetPassword(email: string) {
      try {
        await identity("sendOobCode", { requestType: "PASSWORD_RESET", email });
      } catch (error) {
        if (!(
          error instanceof AuthError && error.code === "credentials-rejected"
        ))
          throw error;
      }
    },
    async usage(token: string) {
      return request(new URL(`${apiUrl.toString().replace(/\/$/, "")}/me/usage`), { headers: { Authorization: `Bearer ${token}` } });
    },
    async projects(token: string) {
      return request(
        new URL(`${apiUrl.toString().replace(/\/$/, "")}/projects?limit=25`),
        { headers: { Authorization: `Bearer ${token}` } },
      );
    },
  };
}
export type AuthProvider = ReturnType<typeof createProvider>;

