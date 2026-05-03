import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "~/lib/supabase/server";
import { db } from "~/server/db";

const paySchema = z.object({
  paymentNote: z.string().max(500).optional(),
});

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

  const body: unknown = await request.json().catch(() => ({}));
  const parsed = paySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const invoice = await db.invoice.findFirst({
    where: { id, userId: user.id },
    select: { status: true },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (invoice.status !== "ACCEPTED") {
    return NextResponse.json(
      { error: "Only accepted invoices can be marked as paid" },
      { status: 400 },
    );
  }

  const updated = await db.invoice.update({
    where: { id },
    data: {
      status: "PAID",
      paidAt: new Date(),
      paymentNote: parsed.data.paymentNote ?? null,
    },
  });

  return NextResponse.json(updated);
}
