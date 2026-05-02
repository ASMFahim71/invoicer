"use client";

import { useState } from "react";
import { CheckCircle, Loader2, Lock, Mail } from "lucide-react";

interface AgreementSectionProps {
  token: string;
  senderEmail: string;
  senderName: string;
  clientEmail: string;
  clientName: string;
}

function getErrorMessage(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const maybeError = (data as Record<string, unknown>).error;
  return typeof maybeError === "string" ? maybeError : null;
}

export function AgreementSection({
  token,
  senderEmail,
  senderName,
  clientEmail,
  clientName,
}: AgreementSectionProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");

  async function handleAccept() {
    setError("");
    if (!email.trim()) {
      setError("Please enter your email to agree.");
      return;
    }
    setLoading(true);

    const res = await fetch(`/api/invoice/${token}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientAgreementEmail: email.trim() }),
    });

    setLoading(false);

    if (!res.ok) {
      const data: unknown = await res.json().catch(() => null);
      setError(getErrorMessage(data) ?? "Something went wrong");
      return;
    }

    setAccepted(true);
  }

  if (accepted) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-950">
          <CheckCircle className="h-7 w-7 text-green-400" />
        </div>
        <p className="text-lg font-semibold text-green-400">Invoice Accepted</p>
        <p className="text-sm text-neutral-400">
          Both parties have been notified. Thank you!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-neutral-600">
          Agreement
        </p>
        <p className="text-sm leading-relaxed text-neutral-500">
          By entering your email below, both parties acknowledge and agree to
          the scope and total amount of this invoice.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Sender side — locked */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-800/30 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-600">
            Sender
          </p>
          <p className="mb-3 truncate text-sm font-medium text-neutral-300">
            {senderName}
          </p>
          <div className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2">
            <Lock className="h-3.5 w-3.5 shrink-0 text-neutral-600" />
            <span className="truncate text-sm text-neutral-500">
              {senderEmail}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
            <span className="text-xs text-green-500">Agreed when sent</span>
          </div>
        </div>

        {/* Client side — input */}
        <div className="rounded-xl border border-indigo-900/60 bg-neutral-800/30 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-600">
            Client
          </p>
          <p className="mb-3 truncate text-sm font-medium text-neutral-300">
            {clientName}
          </p>
          <div className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 focus-within:border-indigo-600 transition-colors">
            <Mail className="h-3.5 w-3.5 shrink-0 text-neutral-600" />
            <input
              type="email"
              placeholder={clientEmail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent text-sm text-neutral-200 placeholder-neutral-600 outline-none"
            />
          </div>
          <p className="mt-2 text-xs text-neutral-600">
            Enter your email to sign
          </p>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-800 bg-red-950 px-4 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        onClick={handleAccept}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <CheckCircle className="h-5 w-5" />
        )}
        Agree &amp; Accept Invoice
      </button>
    </div>
  );
}
