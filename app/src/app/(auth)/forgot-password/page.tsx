"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, MailCheck } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/http";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not request a reset link. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <div>
      <p className="mb-4 text-xs font-semibold uppercase tracking-[.12em] text-brand-600">
        Account recovery
      </p>
      {sent ? (
        <div role="status">
          <MailCheck className="mb-6 h-12 w-12 text-brand-600" />
          <h1>Check your inbox.</h1>
          <p className="mt-4 text-sm leading-7 text-ink-500">
            If an account exists for {email}, you’ll receive an email with
            instructions to reset your password.
          </p>
          <button
            className="mt-5 text-sm font-medium text-brand-600"
            onClick={() => setSent(false)}
          >
            Try another email
          </button>
        </div>
      ) : (
        <>
          <h1>Forgot your password?</h1>
          <p className="mt-3 text-sm leading-7 text-ink-500">
            Enter the email linked to your account and we’ll help you get back
            in.
          </p>
          <form onSubmit={submit} className="mt-8 space-y-5">
            <Field label="Email address" required>
              <Input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
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
            <Button
              type="submit"
              loading={loading}
              size="lg"
              className="w-full"
            >
              Send reset link <ArrowRight size={17} />
            </Button>
          </form>
        </>
      )}
      <Link
        href="/login"
        className="mt-8 flex items-center gap-2 text-sm text-ink-500 hover:text-brand-600"
      >
        <ArrowLeft size={16} /> Back to sign in
      </Link>
    </div>
  );
}
