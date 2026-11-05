"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/http";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { PasswordInput } from "@/components/ui/PasswordInput";

function ResetForm() {
  const token = useSearchParams().get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!token) return;
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not reset your password. Please request a new link.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <div>
      <h1>{done ? "Password updated." : "Choose a new password."}</h1>
      {done ? (
        <p role="status" className="mt-4 text-sm text-ink-500">
          You can now sign in with your new password.
        </p>
      ) : !token ? (
        <p role="alert" className="mt-4 text-sm text-ink-500">
          This link is missing a reset token.{" "}
          <Link href="/forgot-password" className="text-brand-600">
            Request a new reset link.
          </Link>
        </p>
      ) : (
        <form onSubmit={submit} className="mt-7 space-y-5">
          <Field label="New password" required>
            <PasswordInput
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
            />
          </Field>
          <Field label="Confirm new password" required>
            <PasswordInput
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              placeholder="Repeat your password"
            />
          </Field>
          {error && (
            <p
              role="alert"
              className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700"
            >
              {error}
            </p>
          )}
          <Button size="lg" type="submit" loading={loading} className="w-full">
            Reset password
          </Button>
        </form>
      )}
      <Link
        href="/login"
        className="mt-7 inline-flex text-sm font-medium text-brand-600"
      >
        Back to sign in
      </Link>
    </div>
  );
}
export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
