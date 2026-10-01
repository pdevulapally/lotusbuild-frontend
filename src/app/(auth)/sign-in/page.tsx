import { AuthForm } from "@/components/auth/auth-form";
export const metadata = { title: "Sign in — LotusBuild" };
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ resume?: string }>;
}) {
  const params = await searchParams;
  return <AuthForm mode="sign-in" resume={params.resume === "1"} />;
}
