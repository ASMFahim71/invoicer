import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { db } from "~/server/db";
import { InvoiceForm } from "~/components/InvoiceForm";
import { getCurrentUser } from "~/lib/auth";

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const { id } = await params;

  const invoice = await db.invoice.findFirst({
    where: { id, userId: user.id },
    include: { items: true },
  });

  if (!invoice) notFound();

  if (invoice.status === "ACCEPTED") {
    redirect(`/invoices/${id}`);
  }

  const defaultValues = {
    clientName: invoice.clientName,
    clientEmail: invoice.clientEmail,
    projectTitle: invoice.projectTitle,
    notes: invoice.notes ?? "",
    currency: invoice.currency,
    taxPercent: parseFloat(invoice.taxPercent.toString()),
    dueDate: invoice.dueDate
      ? new Date(invoice.dueDate).toISOString().split("T")[0]
      : "",
    items: invoice.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: parseFloat(item.unitPrice.toString()),
    })),
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/invoices/${id}`}
          className="mb-4 flex items-center gap-1.5 text-sm text-neutral-400 transition hover:text-neutral-200"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Invoice
        </Link>
        <h1 className="text-2xl font-bold text-white">
          Edit {invoice.invoiceNumber}
        </h1>
        <p className="mt-0.5 text-sm text-neutral-400">
          Update invoice details below
        </p>
      </div>

      <InvoiceForm
        mode="edit"
        invoiceId={id}
        defaultValues={defaultValues}
      />
    </div>
  );
}
