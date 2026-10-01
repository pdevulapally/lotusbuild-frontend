import { AuthForm } from "@/components/auth/auth-form";
export const metadata = { title: "Reset your password — LotusBuild" };
export default function ForgotPasswordPage() {
  return <AuthForm mode="forgot-password" />;
}
