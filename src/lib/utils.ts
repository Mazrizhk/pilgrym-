import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatLKR(amount: number): string {
  return `LKR ${amount.toLocaleString("en-LK")}`;
}

export function formatDate(date: Date | string, fmt = "d MMM yyyy"): string {
  return format(new Date(date), fmt);
}

export function generateBookingRef(year: number, sequence: number): string {
  return `PIL-${year}-${String(sequence).padStart(4, "0")}`;
}

export function calculateCommission(
  totalAmount: number,
  rate = 0.05
): { commissionAmount: number; agencyAmount: number } {
  const commissionAmount = totalAmount * rate;
  const agencyAmount = totalAmount - commissionAmount;
  return { commissionAmount, agencyAmount };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getDiscountPercent(
  originalPrice: number,
  salePrice: number
): number {
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}
