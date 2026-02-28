import { NextResponse } from "next/server";
import { createClient } from "~/lib/supabase/server";
import { db } from "~/server/db";
import { generateInvoiceNumber } from "~/lib/utils";
import { z } from "zod";

const lineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
});

const createInvoiceSchema = z.object({
  clientName: z.string().min(1),
  clientEmail: z.string().email(),
  projectTitle: z.string().min(1),
  notes: z.string().optional(),
  currency: z.string().length(3).default("USD"),
  taxPercent: z.number().min(0).max(100).default(0),
  dueDate: z.string().nullable().optional(),
  items: z.array(lineItemSchema).min(1),
});

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invoices = await db.invoice.findMany({
    where: { userId: user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(invoices);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createInvoiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { items, dueDate, ...invoiceData } = parsed.data;

  const invoice = await db.invoice.create({
    data: {
      ...invoiceData,
      invoiceNumber: generateInvoiceNumber(),
      dueDate: dueDate ? new Date(dueDate) : null,
      userId: user.id,
      items: {
        create: items,
      },
    },
    include: { items: true },
  });

  return NextResponse.json(invoice, { status: 201 });
}
