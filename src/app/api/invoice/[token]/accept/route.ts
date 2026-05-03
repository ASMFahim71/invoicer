import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { sendInvoiceAcceptedEmails } from "~/lib/email";
import { calculateSubtotal, calculateTotal, formatCurrency, formatDate } from "~/lib/utils";

const acceptSchema = z.object({
  clientAgreementEmail: z.string().email(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const body: unknown = await request.json().catch(() => ({}));
  const parsed = acceptSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "A valid email is required to agree." },
      { status: 400 },
    );
  }

  const invoice = await db.invoice.findUnique({
    where: { token },
    include: {
      user: { select: { email: true, name: true, agencyName: true } },
      items: true,
    },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  if (invoice.status === "ACCEPTED" || invoice.status === "PAID") {
    return NextResponse.json(
      { error: "Invoice already accepted" },
      { status: 400 },
    );
  }

  if (invoice.status === "DRAFT") {
    return NextResponse.json(
      { error: "Invoice has not been sent yet" },
      { status: 400 },
    );
  }

  const acceptedAt = new Date();

  const updated = await db.invoice.update({
    where: { token },
    data: {
      status: "ACCEPTED",
      acceptedAt,
      clientAgreementEmail: parsed.data.clientAgreementEmail,
    },
  });

  const subtotal = calculateSubtotal(
    invoice.items.map((i) => ({ quantity: i.quantity, unitPrice: i.unitPrice.toString() })),
  );
  const total = calculateTotal(subtotal, parseFloat(invoice.taxPercent.toString()));
  const senderName = invoice.user.agencyName ?? invoice.user.name ?? invoice.user.email;

  sendInvoiceAcceptedEmails({
    clientEmail: parsed.data.clientAgreementEmail,
    clientName: invoice.clientName,
    senderEmail: invoice.user.email,
    senderName,
    invoiceNumber: invoice.invoiceNumber,
    projectTitle: invoice.projectTitle,
    total: formatCurrency(total, invoice.currency),
    acceptedAt: formatDate(acceptedAt),
  }).catch(console.error);

  return NextResponse.json(updated);
}
