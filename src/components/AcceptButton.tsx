"use client";

import { useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";

interface AcceptButtonProps {
  token: string;
}

export function AcceptButton({ token }: AcceptButtonProps) {
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");

  async function handleAccept() {
    setLoading(true);
    setError("");

    const res = await fetch(`/api/invoice/${token}/accept`, {
      method: "POST",
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as { error?: string }).error ?? "Something went wrong");
      return;
    }

    setAccepted(true);
  }

  if (accepted) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-950">
          <CheckCircle className="h-6 w-6 text-green-400" />
        </div>
        <p className="font-semibold text-green-400">Invoice Accepted!</p>
        <p className="text-sm text-neutral-400">
          The agency has been notified. Thank you!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {error && (
        <p className="rounded-lg border border-red-800 bg-red-950 px-4 py-2 text-sm text-red-400">
          {error}
        </p>
      )}
      <button
        onClick={handleAccept}
        disabled={loading}
        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <CheckCircle className="h-5 w-5" />
        )}
        Accept Invoice
      </button>
    </div>
  );
}
