import { AuthForm } from "@/components/auth/auth-form";
export const metadata = { title: "Create an account — LotusBuild" };
export default function SignUpPage() {
  return <AuthForm mode="sign-up" />;
}
