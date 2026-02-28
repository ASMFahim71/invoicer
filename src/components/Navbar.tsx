"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { FileText, PlusCircle, LogOut, LayoutDashboard, Settings } from "lucide-react";
import { createClient } from "~/lib/supabase/client";

interface NavbarProps {
  userEmail: string | null;
  agencyName: string | null;
}

export function Navbar({ userEmail, agencyName }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const navItems = [
    { href: "/invoices", label: "Invoices", icon: LayoutDashboard },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      <header className="border-b border-neutral-800 bg-neutral-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link
              href="/invoices"
              className="flex items-center gap-2 text-white"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">Invoicer</span>
            </Link>

            <nav className="hidden items-center gap-1 sm:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition ${
                    pathname === item.href
                      ? "bg-neutral-800 text-white"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/invoices/new"
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-500"
            >
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">New Invoice</span>
            </Link>

            <div className="flex items-center gap-2">
              <div className="hidden flex-col items-end sm:flex">
                {agencyName && (
                  <span className="text-xs font-medium text-neutral-200">
                    {agencyName}
                  </span>
                )}
                <span className="text-xs text-neutral-500">{userEmail}</span>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-800 bg-neutral-900 pb-[env(safe-area-inset-bottom)] sm:hidden">
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition ${
                pathname === item.href
                  ? "text-indigo-400"
                  : "text-neutral-500 active:text-neutral-300"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium text-neutral-500 transition active:text-neutral-300"
          >
            <LogOut className="h-5 w-5" />
            Sign out
          </button>
        </div>
      </nav>
    </>
  );
}
