"use client";

import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusCircle, Trash2, Loader2 } from "lucide-react";
import { formatCurrency, CURRENCIES } from "~/lib/utils";

const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().int().positive("Must be at least 1"),
  unitPrice: z.coerce.number().positive("Must be greater than 0"),
});

export const invoiceFormSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  clientEmail: z.string().email("Invalid email address"),
  projectTitle: z.string().min(1, "Project title is required"),
  notes: z.string().optional(),
  currency: z.string().length(3).default("USD"),
  taxPercent: z.coerce.number().min(0).max(100),
  dueDate: z.string().optional(),
  items: z.array(lineItemSchema).min(1, "At least one line item is required"),
});

export type InvoiceFormInput = z.input<typeof invoiceFormSchema>;
export type InvoiceFormValues = z.output<typeof invoiceFormSchema>;

interface InvoiceFormProps {
  defaultValues?: Partial<InvoiceFormInput>;
  defaultCurrency?: string;
  invoiceId?: string;
  mode: "create" | "edit";
}

function getErrorMessage(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;

  const maybeError = (data as Record<string, unknown>).error;
  return typeof maybeError === "string" ? maybeError : null;
}

export function InvoiceForm({ defaultValues, defaultCurrency, invoiceId, mode }: InvoiceFormProps) {
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormInput, unknown, InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      currency: defaultCurrency ?? "USD",
      taxPercent: 0,
      items: [{ description: "", quantity: 1, unitPrice: 0 }],
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchItems = watch("items");
  const watchTax = watch("taxPercent");
  const watchCurrency = watch("currency") ?? "USD";

  const subtotal = watchItems?.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    return sum + qty * price;
  }, 0) ?? 0;

  const taxAmount = (subtotal * (Number(watchTax) || 0)) / 100;
  const total = subtotal + taxAmount;

  async function onSubmit(data: InvoiceFormValues) {
    const url =
      mode === "create" ? "/api/invoices" : `/api/invoices/${invoiceId}`;
    const method = mode === "create" ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err: unknown = await res.json().catch(() => null);
      alert(getErrorMessage(err) ?? "Something went wrong");
      return;
    }

    const invoice = await res.json() as { id: string };
    router.push(`/invoices/${invoice.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Client Info */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-400">
          Client Details
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-300">
              Client Name
            </label>
            <input
              {...register("clientName")}
              placeholder="Acme Corp"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            {errors.clientName && (
              <p className="mt-1 text-xs text-red-400">
                {errors.clientName.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-300">
              Client Email
            </label>
            <input
              {...register("clientEmail")}
              type="email"
              placeholder="client@company.com"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            {errors.clientEmail && (
              <p className="mt-1 text-xs text-red-400">
                {errors.clientEmail.message}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-neutral-300">
              Project Title
            </label>
            <input
              {...register("projectTitle")}
              placeholder="Mobile App Development"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            {errors.projectTitle && (
              <p className="mt-1 text-xs text-red-400">
                {errors.projectTitle.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
            Line Items
          </h2>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-neutral-500">
              Currency
            </label>
            <select
              {...register("currency")}
              className="rounded-lg border border-neutral-700 bg-neutral-800 px-2.5 py-1.5 text-sm font-medium text-white outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <div className="hidden grid-cols-[1fr_80px_120px_32px] gap-3 sm:grid">
            <span className="text-xs font-medium text-neutral-500">Description</span>
            <span className="text-xs font-medium text-neutral-500">Qty</span>
            <span className="text-xs font-medium text-neutral-500">Unit Price</span>
            <span />
          </div>

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid gap-3 sm:grid-cols-[1fr_80px_120px_32px]"
            >
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-500 sm:hidden">
                  Description
                </label>
                <input
                  {...register(`items.${index}.description`)}
                  placeholder="e.g. UI/UX Design"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                {errors.items?.[index]?.description && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.items[index]?.description?.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-500 sm:hidden">
                  Quantity
                </label>
                <input
                  {...register(`items.${index}.quantity`)}
                  type="number"
                  min="1"
                  placeholder="1"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                {errors.items?.[index]?.quantity && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.items[index]?.quantity?.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-500 sm:hidden">
                  Unit Price
                </label>
                <input
                  {...register(`items.${index}.unitPrice`)}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                {errors.items?.[index]?.unitPrice && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.items[index]?.unitPrice?.message}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
                className="flex h-9 w-9 items-center justify-center self-start rounded-lg text-neutral-500 transition hover:bg-neutral-800 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          {errors.items?.root && (
            <p className="text-xs text-red-400">{errors.items.root.message}</p>
          )}
        </div>

        <button
          type="button"
          onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}
          className="mt-4 flex items-center gap-2 text-sm text-indigo-400 transition hover:text-indigo-300"
        >
          <PlusCircle className="h-4 w-4" />
          Add line item
        </button>
      </div>

      {/* Totals & Settings */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Notes + Due Date */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-400">
            Additional Info
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                Due Date
              </label>
              <input
                {...register("dueDate")}
                type="date"
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                Tax (%)
              </label>
              <input
                {...register("taxPercent")}
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="0"
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                Notes
              </label>
              <textarea
                {...register("notes")}
                rows={3}
                placeholder="Payment terms, bank details, etc."
                className="w-full resize-none rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-400">
            Summary
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-400">Subtotal</span>
              <span className="text-sm text-white">{formatCurrency(subtotal, watchCurrency)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-400">
                Tax ({Number(watchTax) || 0}%)
              </span>
              <span className="text-sm text-white">{formatCurrency(taxAmount, watchCurrency)}</span>
            </div>
            <div className="h-px bg-neutral-800" />
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-white">Total</span>
              <span className="text-xl font-bold text-indigo-400">
                {formatCurrency(total, watchCurrency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-neutral-700 px-5 py-2.5 text-sm font-medium text-neutral-300 transition hover:bg-neutral-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "create" ? "Create Invoice" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
