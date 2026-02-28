"use client";

import { useEffect, useState } from "react";
import { Save, Building2, Coins, CheckCircle, AlertCircle } from "lucide-react";
import { CURRENCIES } from "~/lib/utils";

interface UserProfile {
  email: string;
  name: string | null;
  agencyName: string | null;
  currency: string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [agencyName, setAgencyName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/user");
        if (!res.ok) throw new Error("Failed to load profile");
        const data = (await res.json()) as UserProfile;
        setProfile(data);
        setAgencyName(data.agencyName ?? "");
        setCurrency(data.currency ?? "USD");
      } catch {
        setStatus("error");
        setErrorMessage("Could not load your profile. Please refresh.");
      } finally {
        setLoading(false);
      }
    }
    void fetchProfile();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus("idle");

    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyName: agencyName.trim() || null,
          currency,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to save settings");
      }

      const updated = (await res.json()) as UserProfile;
      setProfile(updated);
      setAgencyName(updated.agencyName ?? "");
      setCurrency(updated.currency);
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 rounded-lg bg-neutral-800" />
        <div className="h-4 w-72 rounded bg-neutral-800" />
        <div className="h-40 rounded-xl bg-neutral-800" />
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Manage your agency profile and preferences
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
            Agency
          </h2>

          {/* Agency Name */}
          <div className="space-y-2">
            <label
              htmlFor="agencyName"
              className="flex items-center gap-2 text-sm font-medium text-neutral-200"
            >
              <Building2 className="h-4 w-4 text-indigo-400" />
              Agency Name
            </label>
            <input
              id="agencyName"
              type="text"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              placeholder="e.g. Acme Studios"
              maxLength={100}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <p className="text-xs text-neutral-500">
              Appears on invoices sent to your clients
            </p>
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <label
              htmlFor="currency"
              className="flex items-center gap-2 text-sm font-medium text-neutral-200"
            >
              <Coins className="h-4 w-4 text-indigo-400" />
              Default Currency
            </label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-neutral-500">
              Used as the default currency when creating new invoices
            </p>
          </div>
        </div>

        {/* Account info (read-only) */}
        {profile && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
              Account
            </h2>
            <div className="space-y-1">
              <p className="text-xs text-neutral-500">Email</p>
              <p className="text-sm text-neutral-200">{profile.email}</p>
            </div>
            {profile.name && (
              <div className="space-y-1">
                <p className="text-xs text-neutral-500">Name</p>
                <p className="text-sm text-neutral-200">{profile.name}</p>
              </div>
            )}
          </div>
        )}

        {/* Status feedback */}
        {status === "success" && (
          <div className="flex items-center gap-2 rounded-lg border border-green-800 bg-green-950 px-4 py-3 text-sm text-green-400">
            <CheckCircle className="h-4 w-4 shrink-0" />
            Settings saved successfully
          </div>
        )}
        {status === "error" && (
          <div className="flex items-center gap-2 rounded-lg border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errorMessage}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
