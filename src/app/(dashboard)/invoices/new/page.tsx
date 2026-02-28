import { redirect } from "next/navigation";
import { InvoiceForm } from "~/components/InvoiceForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "~/lib/auth";
import { db } from "~/server/db";

export default async function NewInvoicePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { currency: true },
  });

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/invoices"
          className="mb-4 flex items-center gap-1.5 text-sm text-neutral-400 transition hover:text-neutral-200"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Invoices
        </Link>
        <h1 className="text-2xl font-bold text-white">New Invoice</h1>
        <p className="mt-0.5 text-sm text-neutral-400">
          Fill in the details below to create a new invoice
        </p>
      </div>

      <InvoiceForm mode="create" defaultCurrency={dbUser?.currency ?? "USD"} />
    </div>
  );
}
