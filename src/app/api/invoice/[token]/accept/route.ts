import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const invoice = await db.invoice.findUnique({
    where: { token },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  if (invoice.status === "ACCEPTED") {
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

  const updated = await db.invoice.update({
    where: { token },
    data: {
      status: "ACCEPTED",
      acceptedAt: new Date(),
    },
  });

  return NextResponse.json(updated);
}
