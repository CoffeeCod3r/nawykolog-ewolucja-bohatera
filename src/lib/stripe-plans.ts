export const STRIPE_PLANS = {
  plus: {
    name: "PLUS",
    monthlyPriceId: "price_1T7HRbINdQapqh7FZvMAGIfU",
    yearlyPriceId: "price_1T7HRtINdQapqh7F5DOWxD84",
    monthlyPrice: 9,
    yearlyPrice: 79,
    features: [
      "Wszystkie nawyki bez limitu",
      "Pełna historia turniejów",
      "Zaawansowane statystyki",
      "Priorytetowe wsparcie",
      "Ekskluzywne odznaki",
    ],
  },
  pro: {
    name: "PRO",
    monthlyPriceId: "price_1T7HSQINdQapqh7Fm3FNoaFl",
    yearlyPriceId: "price_1T7HT2INdQapqh7FRg8XTzgD",
    monthlyPrice: 29,
    yearlyPrice: 249,
    features: [
      "Wszystko z PLUS",
      "+10% do monet w turnieju",
      "Ekskluzywne itemy PRO",
      "Wczesny dostęp do funkcji",
      "Badge PRO przy nicku",
      "Priorytet w matchmakingu",
    ],
  },
} as const;

export type PlanTier = "free" | "plus" | "pro";

export const PLAN_BADGES: Record<PlanTier, { label: string; className: string } | null> = {
  free: null,
  plus: { label: "PLUS", className: "bg-primary/20 text-primary" },
  pro: { label: "PRO", className: "bg-rarity-legendary/20 text-rarity-legendary" },
};
