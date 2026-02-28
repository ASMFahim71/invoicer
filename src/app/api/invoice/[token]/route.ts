import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const invoice = await db.invoice.findUnique({
    where: { token },
    include: { items: true, user: { select: { name: true, email: true } } },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  return NextResponse.json(invoice);
}
