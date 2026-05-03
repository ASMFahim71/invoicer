import { NextResponse } from "next/server";
import { createClient } from "~/lib/supabase/server";
import { db } from "~/server/db";
import { sendInvoiceSentEmail } from "~/lib/email";
import { calculateSubtotal, calculateTotal, formatCurrency } from "~/lib/utils";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const invoice = await db.invoice.findFirst({
    where: { id, userId: user.id },
    include: {
      user: { select: { email: true, name: true, agencyName: true } },
      items: true,
    },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (invoice.status === "ACCEPTED" || invoice.status === "PAID") {
    return NextResponse.json(
      { error: "Invoice is already accepted or paid" },
      { status: 400 },
    );
  }

  const updated = await db.invoice.update({
    where: { id },
    data: {
      status: "SENT",
      senderAgreementEmail: invoice.user.email,
    },
  });

  const origin = new URL(request.url).origin;
  const subtotal = calculateSubtotal(
    invoice.items.map((i) => ({ quantity: i.quantity, unitPrice: i.unitPrice.toString() })),
  );
  const total = calculateTotal(subtotal, parseFloat(invoice.taxPercent.toString()));
  const senderName = invoice.user.agencyName ?? invoice.user.name ?? invoice.user.email;

  try {
    await sendInvoiceSentEmail({
      clientEmail: invoice.clientEmail,
      clientName: invoice.clientName,
      senderName,
      invoiceNumber: invoice.invoiceNumber,
      projectTitle: invoice.projectTitle,
      total: formatCurrency(total, invoice.currency),
      invoiceUrl: `${origin}/invoice/${invoice.token}`,
    });
  } catch (err) {
    console.error("[send-invoice] email failed:", err);
    return NextResponse.json(
      { error: "Invoice marked as sent but email delivery failed", details: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }

  return NextResponse.json(updated);
}
