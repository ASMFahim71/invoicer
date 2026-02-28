export function formatCurrency(
  amount: number | string,
  currency = "USD",
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(num);
}

export const CURRENCIES = [
  { code: "USD", label: "USD — US Dollar" },
  { code: "EUR", label: "EUR — Euro" },
  { code: "GBP", label: "GBP — British Pound" },
  { code: "INR", label: "INR — Indian Rupee" },
  { code: "CAD", label: "CAD — Canadian Dollar" },
  { code: "AUD", label: "AUD — Australian Dollar" },
  { code: "JPY", label: "JPY — Japanese Yen" },
  { code: "SGD", label: "SGD — Singapore Dollar" },
  { code: "AED", label: "AED — UAE Dirham" },
  { code: "BDT", label: "BDT — Bangladeshi Taka" },
  { code: "MYR", label: "MYR — Malaysian Ringgit" },
  { code: "NGN", label: "NGN — Nigerian Naira" },
  { code: "PKR", label: "PKR — Pakistani Rupee" },
  { code: "PHP", label: "PHP — Philippine Peso" },
  { code: "ZAR", label: "ZAR — South African Rand" },
] as const;

export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `INV-${year}-${random}`;
}

export function calculateLineItemTotal(
  quantity: number,
  unitPrice: number,
): number {
  return quantity * unitPrice;
}

export function calculateSubtotal(
  items: { quantity: number; unitPrice: number | string }[],
): number {
  return items.reduce((sum, item) => {
    const price =
      typeof item.unitPrice === "string"
        ? parseFloat(item.unitPrice)
        : item.unitPrice;
    return sum + item.quantity * price;
  }, 0);
}

export function calculateTotal(subtotal: number, taxPercent: number): number {
  return subtotal + (subtotal * taxPercent) / 100;
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
