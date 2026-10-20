export const PRICING = [
  { id: "free", name: "Free", price: "$0", interval: "forever", features: ["20 check cards", "1 job checklist", "Notes (10)"] },
  { id: "monthly", name: "Pro Monthly", price: "$9.99", interval: "/month", features: ["All inspection types", "Unlimited checklists & notes", "Store requests + export", "Offline PWA mode"] },
  { id: "yearly", name: "Pro Yearly", price: "$79.99", interval: "/year", features: ["Everything in Monthly", "2 months free", "Priority editor answers"] },
];

export const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
