import { NextResponse } from "next/server";
import { createClient } from "~/lib/supabase/server";
import { db } from "~/server/db";

export async function POST(
  _request: Request,
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
  });

  if (!invoice) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (invoice.status === "ACCEPTED") {
    return NextResponse.json(
      { error: "Invoice is already accepted" },
      { status: 400 },
    );
  }

  const updated = await db.invoice.update({
    where: { id },
    data: { status: "SENT" },
  });

  return NextResponse.json(updated);
}
