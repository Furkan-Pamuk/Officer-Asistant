// IMO validation (7 digits + check digit). Never invent or guess numbers.

export function normalizeIMO(input: string): string {
  return input.toUpperCase().replace(/^IMO\s*/, "").replace(/\D/g, "");
}

export function checkDigit(firstSix: string): number {
  let sum = 0;
  for (let i = 0; i < 6; i++) {
    sum += Number(firstSix[i]) * (7 - i);
  }
  return sum % 10;
}

export function validateIMO(input: string): { ok: boolean; imo: string; error?: string } {
  const imo = normalizeIMO(input);
  if (!/^\d{7}$/.test(imo)) {
    return { ok: false, imo, error: "IMO must be exactly 7 digits (e.g. 9074729)." };
  }
  if (checkDigit(imo.slice(0, 6)) !== Number(imo[6])) {
    return { ok: false, imo, error: "Invalid IMO check digit — please re-check the number." };
  }
  return { ok: true, imo };
}
