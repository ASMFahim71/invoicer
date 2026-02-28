import { NextResponse } from "next/server";
import { createClient } from "~/lib/supabase/server";
import { db } from "~/server/db";
import { z } from "zod";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { email: true, name: true, agencyName: true, currency: true },
  });

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(dbUser);
}

const updateUserSchema = z.object({
  agencyName: z.string().max(100).optional().nullable(),
  currency: z.string().length(3).toUpperCase().optional(),
});

export async function PATCH(request: Request) {
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

  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const updated = await db.user.update({
    where: { id: user.id },
    data: {
      ...(parsed.data.agencyName !== undefined && {
        agencyName: parsed.data.agencyName,
      }),
      ...(parsed.data.currency !== undefined && {
        currency: parsed.data.currency,
      }),
    },
    select: { email: true, name: true, agencyName: true, currency: true },
  });

  return NextResponse.json(updated);
}
