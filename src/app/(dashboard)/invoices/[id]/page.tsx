import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { db } from "~/server/db";
import { StatusBadge } from "~/components/StatusBadge";
import { formatCurrency, formatDate } from "~/lib/utils";
import { InvoiceActions } from "~/components/InvoiceActions";
import {
  ChevronLeft,
  Building2,
  User,
  Calendar,
  FileText,
  Hash,
} from "lucide-react";
import { getCurrentUser } from "~/lib/auth";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const { id } = await params;

  const invoice = await db.invoice.findFirst({
    where: { id, userId: user.id },
    include: {
      items: true,
      user: { select: { name: true, email: true, agencyName: true } },
    },
  });

  if (!invoice) notFound();

  const subtotal = invoice.items.reduce(
    (sum, item) =>
      sum + item.quantity * parseFloat(item.unitPrice.toString()),
    0,
  );
  const taxPercent = parseFloat(invoice.taxPercent.toString());
  const taxAmount = (subtotal * taxPercent) / 100;
  const total = subtotal + taxAmount;

  return (
    <div className="pb-8">
      {/* Back link */}
      <Link
        href="/invoices"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-neutral-500 transition hover:text-neutral-200"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Invoices
      </Link>

      {/* Hero header */}
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-3">
            <StatusBadge status={invoice.status} />
            <span className="font-mono text-xs tracking-wide text-neutral-500">
              {invoice.invoiceNumber}
            </span>
          </div>
          <h1 className="truncate text-2xl font-bold text-white sm:text-3xl">
            {invoice.projectTitle}
          </h1>
          <p className="mt-1.5 text-sm text-neutral-500">
            Created {formatDate(invoice.createdAt)}
            {invoice.acceptedAt && (
              <> &middot; Accepted {formatDate(invoice.acceptedAt)}</>
            )}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
            Total Due
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-white sm:text-4xl">
            {formatCurrency(total, invoice.currency)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mb-8">
        <InvoiceActions
          invoiceId={invoice.id}
          invoiceToken={invoice.token}
          status={invoice.status}
        />
      </div>

      {/* FROM / BILL TO cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600/20">
              <Building2 className="h-3.5 w-3.5 text-indigo-400" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              From
            </span>
          </div>
          <p className="font-semibold text-white">
            {invoice.user.agencyName ?? invoice.user.name ?? invoice.user.email}
          </p>
          {invoice.user.agencyName && invoice.user.name && (
            <p className="mt-0.5 text-sm text-neutral-300">
              {invoice.user.name}
            </p>
          )}
          <p className="mt-0.5 text-sm text-neutral-500">
            {invoice.user.email}
          </p>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600/20">
              <User className="h-3.5 w-3.5 text-indigo-400" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Bill To
            </span>
          </div>
          <p className="font-semibold text-white">{invoice.clientName}</p>
          <p className="mt-0.5 text-sm text-neutral-500">
            {invoice.clientEmail}
          </p>
        </div>
      </div>

      {/* Invoice details strip */}
      <div className="mb-6 flex flex-wrap gap-x-6 gap-y-3 rounded-xl border border-neutral-800 bg-neutral-900 px-5 py-4">
        <div className="flex items-center gap-2 text-sm">
          <Hash className="h-3.5 w-3.5 text-neutral-600" />
          <span className="text-neutral-500">Invoice</span>
          <span className="font-mono font-medium text-neutral-200">
            {invoice.invoiceNumber}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <FileText className="h-3.5 w-3.5 text-neutral-600" />
          <span className="text-neutral-500">Project</span>
          <span className="font-medium text-neutral-200">
            {invoice.projectTitle}
          </span>
        </div>
        {invoice.dueDate && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-3.5 w-3.5 text-neutral-600" />
            <span className="text-neutral-500">Due</span>
            <span className="font-medium text-neutral-200">
              {formatDate(invoice.dueDate)}
            </span>
          </div>
        )}
      </div>

      {/* Line Items */}
      <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
        {/* Desktop table */}
        <div className="hidden sm:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/80">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Description
                </th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Qty
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Unit Price
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {invoice.items.map((item) => {
                const lineTotal =
                  item.quantity * parseFloat(item.unitPrice.toString());
                return (
                  <tr key={item.id} className="transition hover:bg-neutral-800/30">
                    <td className="px-5 py-4 text-sm text-neutral-200">
                      {item.description}
                    </td>
                    <td className="px-5 py-4 text-center text-sm tabular-nums text-neutral-400">
                      {item.quantity}
                    </td>
                    <td className="px-5 py-4 text-right text-sm tabular-nums text-neutral-400">
                      {formatCurrency(parseFloat(item.unitPrice.toString()), invoice.currency)}
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-semibold tabular-nums text-white">
                      {formatCurrency(lineTotal, invoice.currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile line items */}
        <div className="divide-y divide-neutral-800/50 sm:hidden">
          {invoice.items.map((item) => {
            const lineTotal =
              item.quantity * parseFloat(item.unitPrice.toString());
            return (
              <div key={item.id} className="flex items-center justify-between px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-neutral-200">
                    {item.description}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {item.quantity} &times;{" "}
                    {formatCurrency(parseFloat(item.unitPrice.toString()), invoice.currency)}
                  </p>
                </div>
                <p className="ml-4 text-sm font-semibold tabular-nums text-white">
                  {formatCurrency(lineTotal, invoice.currency)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Totals */}
        <div className="border-t border-neutral-800 bg-neutral-950/40 px-5 py-5">
          <div className="ml-auto w-full max-w-xs space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Subtotal</span>
              <span className="tabular-nums text-neutral-300">
                {formatCurrency(subtotal, invoice.currency)}
              </span>
            </div>
            {taxPercent > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Tax ({taxPercent}%)</span>
                <span className="tabular-nums text-neutral-300">
                  {formatCurrency(taxAmount, invoice.currency)}
                </span>
              </div>
            )}
            <div className="h-px bg-neutral-800" />
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-neutral-300">
                Total
              </span>
              <span className="text-xl font-bold tabular-nums text-indigo-400">
                {formatCurrency(total, invoice.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900 p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Notes
          </p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-300">
            {invoice.notes}
          </p>
        </div>
      )}
    </div>
  );
}
