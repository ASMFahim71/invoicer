import { redirect } from "next/navigation";
import { Navbar } from "~/components/Navbar";
import { getCurrentUser } from "~/lib/auth";
import { db } from "~/server/db";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { agencyName: true },
  });

  return (
    <div className="min-h-dvh bg-neutral-950">
      <Navbar
        userEmail={user.email ?? null}
        agencyName={dbUser?.agencyName ?? null}
      />
      <main className="mx-auto max-w-6xl px-4 py-8 pb-24 sm:pb-8">{children}</main>
    </div>
  );
}
