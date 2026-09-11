/**
 * Normalizes a Brazilian phone number to the international format required by
 * WhatsApp's wa.me links (and the WhatsApp Business API).
 *
 * Rules:
 * 1. Strip all non-digit characters
 * 2. If it already starts with "55" AND has 12 or 13 digits → return as is
 * 3. If it has 10 digits (landline: DDD + 8) → prepend "55" → 12 digits
 * 4. If it has 11 digits (mobile: DDD + 9 + 8) → prepend "55" → 13 digits
 * 5. If it has 8 or 9 digits (no DDD) → prepend "55" + default DDD is impossible, return as is
 * 6. If it has 13 digits but starts with "55" already → return as is
 * 7. Otherwise → return the digits as is (let WhatsApp decide)
 *
 * Examples:
 *   "(81) 98177-4711"   → "5581981774711"  (mobile, 11 digits → prepend 55)
 *   "(81) 3325-1984"    → "558133251984"   (landline, 10 digits → prepend 55)
 *   "+55 81 98177-4711" → "5581981774711"  (already has 55)
 *   "5581981774711"     → "5581981774711"  (already correct)
 *   "81981774711"       → "5581981774711"  (11 digits, no 55 → prepend)
 *
 * @param phone Raw phone string (may contain formatting, +, spaces, dashes, parens)
 * @returns Normalized digits-only string with country code, or null if input is empty
 */
export function normalizeBrazilianPhone(phone: string | null | undefined): string | null {
  if (!phone) return null;

  // Strip all non-digit characters
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 0) return null;

  // Already has country code "55"
  if (digits.startsWith("55")) {
    // Brazilian numbers with country code are 12 (landline) or 13 (mobile) digits
    if (digits.length === 12 || digits.length === 13) {
      return digits;
    }
    // Starts with 55 but wrong length — could be a Brazilian number that happens
    // to start with 55 as DDD (e.g., 55 3222-1234 in Rio Grande do Sul)
    // In this case, the DDD is 55 and we need to add the country code 55
    // So "5532221234" (10 digits) → "555532221234" (12 digits)
    if (digits.length === 10 || digits.length === 11) {
      return "55" + digits;
    }
    return digits;
  }

  // No country code — add it for Brazilian numbers
  // 10 digits = DDD (2) + landline (8) → prepend "55" → 12 digits
  // 11 digits = DDD (2) + mobile (9) → prepend "55" → 13 digits
  if (digits.length === 10 || digits.length === 11) {
    return "55" + digits;
  }

  // 8 or 9 digits = no DDD, can't reliably add country code
  // Return as is and let WhatsApp handle it
  return digits;
}

/**
 * Formats a normalized phone number for display in the UI.
 * Example: "5581981774711" → "+55 (81) 98177-4711"
 */
export function formatPhoneForDisplay(phone: string | null | undefined): string {
  if (!phone) return "—";
  const normalized = normalizeBrazilianPhone(phone);
  if (!normalized) return "—";

  // Already international format with 55
  if (normalized.startsWith("55") && (normalized.length === 12 || normalized.length === 13)) {
    const ddi = "55";
    const rest = normalized.slice(2);
    if (rest.length === 10) {
      // DDD (2) + 8 digits
      const ddd = rest.slice(0, 2);
      const part1 = rest.slice(2, 6);
      const part2 = rest.slice(6);
      return `+${ddi} (${ddd}) ${part1}-${part2}`;
    }
    if (rest.length === 11) {
      // DDD (2) + 9 digits (mobile)
      const ddd = rest.slice(0, 2);
      const part1 = rest.slice(2, 7);
      const part2 = rest.slice(7);
      return `+${ddi} (${ddd}) ${part1}-${part2}`;
    }
  }

  // Fallback: return the digits
  return normalized;
}
