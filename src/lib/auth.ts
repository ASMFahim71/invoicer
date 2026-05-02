import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "./supabase/server";
import { db } from "~/server/db";

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

function extractName(user: User): string | null {
  const md = user.user_metadata as Record<string, unknown> | undefined;
  if (typeof md?.full_name === "string" && md.full_name.trim()) return md.full_name;
  if (typeof md?.name === "string" && md.name.trim()) return md.name;
  return null;
}

/**
 * Ensures the Supabase Auth user has a matching row in the Prisma `User` table.
 * Returns the DB user row. Safe to call repeatedly (upsert is idempotent).
 */
export async function ensureDbUser(user: User) {
  return db.user.upsert({
    where: { id: user.id },
    update: {},
    create: {
      id: user.id,
      email: user.email!,
      name: extractName(user),
    },
  });
}

