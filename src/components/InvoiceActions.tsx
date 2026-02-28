"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { InvoiceStatus } from "../../generated/prisma";
import {
  Send,
  Copy,
  Check,
  Pencil,
  Trash2,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface InvoiceActionsProps {
  invoiceId: string;
  invoiceToken: string;
  status: InvoiceStatus;
}

export function InvoiceActions({
  invoiceId,
  invoiceToken,
  status,
}: InvoiceActionsProps) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/invoice/${invoiceToken}`
      : `/invoice/${invoiceToken}`;

  async function handleSend() {
    setSending(true);
    const res = await fetch(`/api/invoices/${invoiceId}/send`, {
      method: "POST",
    });
    setSending(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert((err as { error?: string }).error ?? "Failed to send invoice");
      return;
    }

    router.refresh();
  }

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/invoices/${invoiceId}`, {
      method: "DELETE",
    });
    setDeleting(false);

    if (!res.ok) {
      alert("Failed to delete invoice");
      return;
    }

    router.push("/invoices");
    router.refresh();
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const btnBase =
    "inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition";
  const btnSecondary = `${btnBase} border-neutral-700 bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700 hover:text-white`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "DRAFT" && (
        <button
          onClick={handleSend}
          disabled={sending}
          className={`${btnBase} border-blue-600 bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-60`}
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span className="hidden xs:inline">Mark as</span> Sent
        </button>
      )}

      {status !== "ACCEPTED" && (
        <Link
          href={`/invoices/${invoiceId}/edit`}
          className={btnSecondary}
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Link>
      )}

      {status !== "DRAFT" && (
        <>
          <button onClick={handleCopyLink} className={btnSecondary}>
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-400" />
                <span className="hidden sm:inline">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span className="hidden sm:inline">Copy Link</span>
              </>
            )}
          </button>

          <a
            href={`/invoice/${invoiceToken}`}
            target="_blank"
            rel="noopener noreferrer"
            className={btnSecondary}
          >
            <ExternalLink className="h-4 w-4" />
            <span className="hidden sm:inline">Preview</span>
          </a>
        </>
      )}

      {!showDeleteConfirm ? (
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className={`${btnBase} border-neutral-700 bg-neutral-800/80 text-neutral-400 hover:border-red-800 hover:bg-red-950 hover:text-red-400`}
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">Delete</span>
        </button>
      ) : (
        <div className="flex items-center gap-2 rounded-lg border border-red-800 bg-red-950 px-3 py-2">
          <span className="text-sm text-red-400">Delete?</span>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm font-semibold text-red-300 hover:text-red-200 disabled:opacity-60"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Yes"
            )}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="text-sm text-neutral-400 hover:text-neutral-200"
          >
            No
          </button>
        </div>
      )}
    </div>
  );
}
