import type { InvoiceStatus } from "../../generated/prisma";

const statusConfig: Record<
  InvoiceStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Draft",
    className:
      "bg-neutral-800 text-neutral-300 border border-neutral-700",
  },
  SENT: {
    label: "Sent",
    className:
      "bg-blue-950 text-blue-300 border border-blue-800",
  },
  ACCEPTED: {
    label: "Accepted",
    className:
      "bg-green-950 text-green-300 border border-green-800",
  },
};

interface StatusBadgeProps {
  status: InvoiceStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
