import { NextResponse } from "next/server";
import { createClient } from "~/lib/supabase/server";
import { db } from "~/server/db";

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
          name:
            data.user.user_metadata?.full_name ??
            data.user.user_metadata?.name ??
            null,
        },
        create: {
          id: data.user.id,
          email: data.user.email!,
          name:
            data.user.user_metadata?.full_name ??
            data.user.user_metadata?.name ??
            null,
        },
      });

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
