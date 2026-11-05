"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { Button } from "@/components/ui/Button";
function Verification() {
  const token = useSearchParams().get("token");
  const [state, setState] = useState<"ready" | "loading" | "done" | "error">(
    "ready",
  );
  const [error, setError] = useState("");
  async function verify() {
    if (!token) return;
    setState("loading");
    try {
      await authApi.verifyEmail(token);
      setState("done");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "This link could not be verified.",
      );
      setState("error");
    }
  }
  return (
    <div className="space-y-5">
      <h1>{state === "done" ? "Email verified." : "Verify your email."}</h1>
      <p className="text-base leading-7 text-ink-500">
        {state === "done"
          ? "Your Medora account is ready. Sign in to continue."
          : token
            ? "Confirm your email address to complete your account verification."
            : "This link is missing its verification token. Open the complete link from your welcome email."}
      </p>
      {error && (
        <p role="alert" className="rounded-xl bg-rose-50 p-4 text-rose-700">
          {error}
        </p>
      )}
      {token && state !== "done" && (
        <Button onClick={verify} loading={state === "loading"}>
          Verify email address
        </Button>
      )}
      <div>
        <Link href="/login" className="text-brand-600">
          Continue to sign in
        </Link>
      </div>
    </div>
  );
}
export default function VerifyEmailPage() {
  return (
    <Suspense>
      <Verification />
    </Suspense>
  );
}
