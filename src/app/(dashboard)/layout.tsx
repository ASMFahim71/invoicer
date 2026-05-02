import { redirect } from "next/navigation";
import { Navbar } from "~/components/Navbar";
import { getCurrentUser, ensureDbUser } from "~/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const dbUser = await ensureDbUser(user);

  return (
    <div className="min-h-dvh bg-neutral-950">
      <Navbar
        userEmail={user.email ?? null}
        agencyName={dbUser.agencyName ?? null}
      />
      <main className="mx-auto max-w-6xl px-4 py-8 pb-24 sm:pb-8">{children}</main>
    </div>
  );
}
