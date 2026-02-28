import { NextResponse } from "next/server";
import { createClient } from "~/lib/supabase/server";
import { db } from "~/server/db";

function getMetadataName(userMetadata: unknown): string | null {
  if (!userMetadata || typeof userMetadata !== "object") return null;

  const metadata = userMetadata as Record<string, unknown>;
  const fullName = metadata.full_name;
  if (typeof fullName === "string" && fullName.trim().length > 0) {
    return fullName;
  }

  const name = metadata.name;
  if (typeof name === "string" && name.trim().length > 0) {
    return name;
  }

  return null;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/invoices";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Upsert user into our database
      await db.user.upsert({
        where: { id: data.user.id },
        update: {
          email: data.user.email!,
          name: getMetadataName(data.user.user_metadata),
        },
        create: {
          id: data.user.id,
          email: data.user.email!,
          name: getMetadataName(data.user.user_metadata),
        },
      });

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
