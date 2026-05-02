import { NextResponse } from "next/server";
import { createClient } from "~/lib/supabase/server";
import { ensureDbUser } from "~/lib/auth";
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

  const dbUser = await ensureDbUser(user);

  return NextResponse.json({
    email: dbUser.email,
    name: dbUser.name,
    agencyName: dbUser.agencyName,
    currency: dbUser.currency,
  });
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

  const data = {
    ...(parsed.data.agencyName !== undefined && {
      agencyName: parsed.data.agencyName,
    }),
    ...(parsed.data.currency !== undefined && {
      currency: parsed.data.currency,
    }),
  };

  const updated = await db.user.upsert({
    where: { id: user.id },
    update: data,
    create: {
      id: user.id,
      email: user.email!,
      ...data,
    },
    select: { email: true, name: true, agencyName: true, currency: true },
  });

  return NextResponse.json(updated);
}
