import { notFound } from "next/navigation";
import { db } from "~/server/db";
import { formatCurrency, formatDate } from "~/lib/utils";
import { FileText } from "lucide-react";
import { AcceptButton } from "~/components/AcceptButton";

export default async function PublicInvoicePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const invoice = await db.invoice.findUnique({
    where: { token },
    include: { items: true, user: { select: { name: true, email: true, agencyName: true } } },
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
    <div className="min-h-screen bg-neutral-950 px-4 py-8 sm:py-14">
      {/* Brand bar */}
      <div className="mx-auto mb-6 flex max-w-3xl items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold tracking-tight">invoicer</span>
        </div>
        <span className="text-xs font-medium uppercase tracking-widest text-neutral-600">
          Invoice
        </span>
      </div>

      {/* Invoice Card */}
      <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl shadow-black/60">

        {/* Status Banners */}
        {invoice.status === "ACCEPTED" && (
          <div className="flex items-center justify-center gap-2 border-b border-green-900/60 bg-green-950/70 px-6 py-3">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
            <p className="text-sm font-medium text-green-300">
              Accepted on {formatDate(invoice.acceptedAt)}
            </p>
          </div>
        )}
        {invoice.status === "DRAFT" && (
          <div className="flex items-center justify-center gap-2 border-b border-amber-900/60 bg-amber-950/70 px-6 py-3">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
            <p className="text-sm font-medium text-amber-300">
              Draft — not yet sent to client
            </p>
          </div>
        )}

        {/* Header */}
        <div className="border-b border-neutral-800 px-6 py-8 sm:px-10">
          {/* Invoice title row */}
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Invoice
              </h1>
              {invoice.projectTitle && (
                <p className="mt-1 text-sm text-neutral-400">
                  {invoice.projectTitle}
                </p>
              )}
            </div>
            <div className="rounded-xl border border-neutral-800 bg-neutral-800/40 px-5 py-4 sm:text-right">
              <p className="font-mono text-lg font-bold text-indigo-400 sm:text-xl">
                {invoice.invoiceNumber}
              </p>
              <div className="mt-2 space-y-0.5 text-xs text-neutral-500">
                <p>
                  Issued{" "}
                  <span className="text-neutral-300">
                    {formatDate(invoice.createdAt)}
                  </span>
                </p>
                {invoice.dueDate && (
                  <p>
                    Due{" "}
                    <span className="text-neutral-300">
                      {formatDate(invoice.dueDate)}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* From / Bill To */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-neutral-600">
                From
              </p>
              <p className="font-semibold text-white">
                {invoice.user.agencyName ?? invoice.user.name ?? invoice.user.email}
              </p>
              {invoice.user.agencyName && invoice.user.name && (
                <p className="mt-0.5 text-sm text-neutral-300">{invoice.user.name}</p>
              )}
              <p className="mt-0.5 text-sm text-neutral-400">
                {invoice.user.email}
              </p>
            </div>
            <div className="sm:border-l sm:border-neutral-800 sm:pl-6">
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-neutral-600">
                Bill To
              </p>
              <p className="font-semibold text-white">{invoice.clientName}</p>
              <p className="mt-0.5 text-sm text-neutral-400">
                {invoice.clientEmail}
              </p>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="px-6 py-8 sm:px-10">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-600">
            Services
          </p>

          {/* Desktop table */}
          <div className="hidden sm:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="pb-3 text-left text-xs font-medium text-neutral-500">
                    Description
                  </th>
                  <th className="pb-3 text-center text-xs font-medium text-neutral-500">
                    Qty
                  </th>
                  <th className="pb-3 text-right text-xs font-medium text-neutral-500">
                    Rate
                  </th>
                  <th className="pb-3 text-right text-xs font-medium text-neutral-500">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, i) => {
                  const lineTotal =
                    item.quantity * parseFloat(item.unitPrice.toString());
                  return (
                    <tr
                      key={item.id}
                      className={
                        i < invoice.items.length - 1
                          ? "border-b border-neutral-800/40"
                          : ""
                      }
                    >
                      <td className="py-4 pr-6 text-sm text-neutral-200">
                        {item.description}
                      </td>
                      <td className="py-4 text-center text-sm tabular-nums text-neutral-400">
                        {item.quantity}
                      </td>
                      <td className="py-4 text-right text-sm tabular-nums text-neutral-400">
                        {formatCurrency(parseFloat(item.unitPrice.toString()), invoice.currency)}
                      </td>
                      <td className="py-4 text-right text-sm font-semibold tabular-nums text-white">
                        {formatCurrency(lineTotal, invoice.currency)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-2.5 sm:hidden">
            {invoice.items.map((item) => {
              const lineTotal =
                item.quantity * parseFloat(item.unitPrice.toString());
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-neutral-800 bg-neutral-800/30 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium leading-snug text-neutral-200">
                      {item.description}
                    </p>
                    <p className="shrink-0 text-sm font-bold tabular-nums text-white">
                      {formatCurrency(lineTotal, invoice.currency)}
                    </p>
                  </div>
                  <p className="mt-1.5 text-xs tabular-nums text-neutral-500">
                    {item.quantity} ×{" "}
                    {formatCurrency(parseFloat(item.unitPrice.toString()), invoice.currency)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Totals */}
          <div className="mt-8 flex justify-end">
            <div className="w-full rounded-xl border border-neutral-800 bg-neutral-800/20 p-5 sm:max-w-xs">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-400">Subtotal</span>
                  <span className="tabular-nums text-neutral-200">
                    {formatCurrency(subtotal, invoice.currency)}
                  </span>
                </div>
                {taxPercent > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-400">Tax ({taxPercent}%)</span>
                    <span className="tabular-nums text-neutral-200">
                      {formatCurrency(taxAmount, invoice.currency)}
                    </span>
                  </div>
                )}
              </div>
              <div className="my-3 h-px bg-neutral-800" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">
                  Total Due
                </span>
                <span className="text-2xl font-bold tabular-nums text-indigo-400">
                  {formatCurrency(total, invoice.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-800/20 p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-neutral-600">
                Notes
              </p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-400">
                {invoice.notes}
              </p>
            </div>
          )}
        </div>

        {/* Accept Footer */}
        {invoice.status === "SENT" && (
          <div className="border-t border-neutral-800 bg-neutral-950/50 px-6 py-8 sm:px-10">
            <div className="mx-auto max-w-sm text-center">
              <p className="mb-1 text-sm font-semibold text-neutral-200">
                Ready to confirm this project?
              </p>
              <p className="mb-6 text-sm leading-relaxed text-neutral-500">
                By accepting, you agree to the scope and total amount of{" "}
                <span className="font-semibold text-white">
                  {formatCurrency(total, invoice.currency)}
                </span>
                .
              </p>
              <AcceptButton token={token} />
            </div>
          </div>
        )}
      </div>

      <p className="mt-8 text-center text-xs text-neutral-700">
        Powered by invoicer · {new Date().getFullYear()}
      </p>
    </div>
  );
}
