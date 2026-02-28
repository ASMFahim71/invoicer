import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import { StatusBadge } from "~/components/StatusBadge";
import { formatCurrency, formatDate } from "~/lib/utils";
import { PlusCircle, FileText, ChevronRight } from "lucide-react";
import { getCurrentUser } from "~/lib/auth";
import type { InvoiceStatus } from "../../../../generated/prisma";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const { status: statusFilter } = await searchParams;

  const validStatuses: InvoiceStatus[] = ["DRAFT", "SENT", "ACCEPTED"];
  const normalizedStatus =
    statusFilter &&
    validStatuses.includes(statusFilter.toUpperCase() as InvoiceStatus)
      ? (statusFilter.toUpperCase() as InvoiceStatus)
      : undefined;

  const [invoices, statusCounts] = await Promise.all([
    db.invoice.findMany({
      where: {
        userId: user.id,
        ...(normalizedStatus && { status: normalizedStatus }),
      },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    }),
    db.invoice.groupBy({
      by: ["status"],
      where: { userId: user.id },
      _count: true,
    }),
  ]);

  const counts = statusCounts.reduce(
    (acc, row) => {
      acc.all += row._count;
      acc[row.status] += row._count;
      return acc;
    },
    { all: 0, DRAFT: 0, SENT: 0, ACCEPTED: 0 },
  );

  const filters = [
    { label: "All", value: "", count: counts.all },
    { label: "Draft", value: "draft", count: counts.DRAFT },
    { label: "Sent", value: "sent", count: counts.SENT },
    { label: "Accepted", value: "accepted", count: counts.ACCEPTED },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Invoices</h1>
          <p className="mt-0.5 text-sm text-neutral-400">
            Manage and track your client invoices
          </p>
        </div>
        <Link
          href="/invoices/new"
          className="flex shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
        >
          <PlusCircle className="h-4 w-4" />
          <span className="hidden sm:inline">New Invoice</span>
          <span className="sm:hidden">New</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        {filters.map((filter) => {
          const isActive =
            (filter.value === "" && !statusFilter) ||
            filter.value === statusFilter?.toLowerCase();
          return (
            <Link
              key={filter.value}
              href={filter.value ? `?status=${filter.value}` : "/invoices"}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition ${
                isActive
                  ? "bg-neutral-800 text-white"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {filter.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs ${
                  isActive
                    ? "bg-neutral-700 text-neutral-200"
                    : "text-neutral-500"
                }`}
              >
                {filter.count}
              </span>
            </Link>
          );
        })}
      </div>

      {invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-800 py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900">
            <FileText className="h-7 w-7 text-neutral-600" />
          </div>
          <h3 className="mb-1 text-lg font-medium text-neutral-300">
            No invoices yet
          </h3>
          <p className="mb-5 text-sm text-neutral-500">
            Create your first invoice to get started
          </p>
          <Link
            href="/invoices/new"
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            <PlusCircle className="h-4 w-4" />
            Create Invoice
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-neutral-800 md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-900/60">
                  <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Invoice
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Client
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Project
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Due Date
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Amount
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Status
                  </th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 bg-neutral-900">
                {invoices.map((invoice) => {
                  const subtotal = invoice.items.reduce(
                    (sum, item) =>
                      sum +
                      item.quantity * parseFloat(item.unitPrice.toString()),
                    0,
                  );
                  const tax = parseFloat(invoice.taxPercent.toString());
                  const total = subtotal + (subtotal * tax) / 100;

                  return (
                    <tr
                      key={invoice.id}
                      className="group transition hover:bg-neutral-800/40"
                    >
                      <td className="px-5 py-4">
                        <span className="font-mono text-sm text-indigo-400">
                          {invoice.invoiceNumber}
                        </span>
                        <p className="mt-0.5 text-xs text-neutral-500">
                          {formatDate(invoice.createdAt)}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-white">
                          {invoice.clientName}
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-500">
                          {invoice.clientEmail}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-neutral-300">
                          {invoice.projectTitle}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-neutral-400">
                          {formatDate(invoice.dueDate)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm font-semibold tabular-nums text-white">
                          {formatCurrency(total, invoice.currency)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={invoice.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="inline-flex items-center gap-1 text-xs text-neutral-500 transition group-hover:text-indigo-400"
                        >
                          View
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {invoices.map((invoice) => {
              const subtotal = invoice.items.reduce(
                (sum, item) =>
                  sum + item.quantity * parseFloat(item.unitPrice.toString()),
                0,
              );
              const tax = parseFloat(invoice.taxPercent.toString());
              const total = subtotal + (subtotal * tax) / 100;

              return (
                <Link
                  key={invoice.id}
                  href={`/invoices/${invoice.id}`}
                  className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900 p-4 transition hover:border-neutral-700 hover:bg-neutral-800/60"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-sm font-medium text-indigo-400">
                        {invoice.invoiceNumber}
                      </span>
                      <StatusBadge status={invoice.status} />
                    </div>
                    <p className="mt-1 truncate text-sm font-medium text-white">
                      {invoice.clientName}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-neutral-500">
                      {invoice.projectTitle} · Due {formatDate(invoice.dueDate)}
                    </p>
                  </div>
                  <div className="ml-4 flex shrink-0 items-center gap-2">
                    <span className="text-sm font-bold tabular-nums text-white">
                      {formatCurrency(total, invoice.currency)}
                    </span>
                    <ChevronRight className="h-4 w-4 text-neutral-600" />
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
