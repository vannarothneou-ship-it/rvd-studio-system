import { useEffect, useRef, useState } from "react";
import {
  Baby,
  Briefcase,
  Building2,
  Car,
  Coffee,
  Coins,
  CreditCard,
  Fuel,
  Gift,
  Hammer,
  HeartPulse,
  Landmark,
  Laptop,
  Megaphone,
  Monitor,
  Package,
  PiggyBank,
  Plane,
  Printer,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Type,
  Users,
  Utensils,
  UtensilsCrossed,
  Wallet,
  Wifi,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { money, today, type Expense } from "@/lib/store";

const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  Food: Utensils,
  "Food and groceries": Utensils,
  Transportation: Car,
  Transport: Car,
  Kid: Baby,
  Family: Baby,
  "Personal Spending": ShoppingBag,
  Shopping: ShoppingBag,
  Utilities: Zap,
  "Medical & Healthcare": HeartPulse,
  Health: HeartPulse,
  "Saving & Investing": PiggyBank,
  "Prius 2012": Wrench,
  "Software and subscriptions": Laptop,
  "Fonts and licenses": Type,
  "Printing and production": Printer,
  "Fabrication and vendors": Hammer,
  Freelancers: Users,
  Marketing: Megaphone,
  Equipment: Monitor,
  "Office and utilities": Building2,
  Other: Package,
};

export function categoryIcon(category: string): LucideIcon {
  return CATEGORY_ICON_MAP[category] ?? Briefcase;
}

const INCOME_ICON_MAP: Record<string, LucideIcon> = {
  Salary: Briefcase,
  "Studio Draw": Building2,
  Freelance: Laptop,
  Bonus: Sparkles,
  Investment: TrendingUp,
  "Gift & Refund": Gift,
  Other: Coins,
};

export function incomeSourceIcon(source: string): LucideIcon {
  return INCOME_ICON_MAP[source] ?? Coins;
}

export function paymentCardIcon(method: string): LucideIcon {
  const m = method.trim().toLowerCase();
  if (m.includes("credit")) return CreditCard;
  if (
    m.includes("debit") ||
    m.includes("aba") ||
    m.includes("acleda") ||
    m.includes("canadia")
  )
    return Landmark;
  if (m.includes("khqr") || m.includes("wing")) return Smartphone;
  if (m.includes("cash")) return Wallet;
  return CreditCard;
}

export function expenseItemIcon(
  e: Pick<Expense, "category" | "description" | "vendor">,
): LucideIcon {
  const text = `${e.description} ${e.vendor}`.toLowerCase();
  if (/coffee|cafe|latte|espresso|matcha|tea/.test(text)) return Coffee;
  if (/gas|fuel|totalenergies|ptt|caltex|petrol/.test(text)) return Fuel;
  if (/flight|airport|airline|plane|trip/.test(text)) return Plane;
  if (/tuktuk|tuk tuk|passapp|grab|taxi|bus|ride/.test(text)) return Car;
  if (/grocer|aeon|supermarket|lucky|market|mart/.test(text))
    return ShoppingCart;
  if (/milk|diaper|formula|baby|kid|toddler|stroller|toy/.test(text))
    return Baby;
  if (
    /breakfast|lunch|dinner|pizza|burger|congee|rice|noodle|meal|ramen/.test(
      text,
    )
  )
    return UtensilsCrossed;
  if (/internet|wifi|metfone|cellcard|smart|sinet|ezecom/.test(text))
    return Wifi;
  if (/edc|electric|water|ppwsa|power|utility|bill/.test(text)) return Zap;
  if (
    /hospital|clinic|dentist|doctor|pharmacy|medicine|checkup|vitamin/.test(
      text,
    )
  )
    return Stethoscope;
  if (/gold|invest|saving|deposit|bank/.test(text)) return Coins;
  if (/prius|oil|tire|brake|battery|mechanic|service|car|wash/.test(text))
    return Wrench;
  if (/adobe|figma|framer|software|cloud|domain|hosting/.test(text))
    return Laptop;
  if (/print|proof|box|packaging|paper/.test(text)) return Printer;
  return categoryIcon(e.category);
}

export function AnimatedNumber({
  value,
  format = (n) => money(n),
  duration = 180,
  className,
}: {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const startVal = prevRef.current;
    prevRef.current = value;
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplay(value);
      return;
    }
    const diff = value - startVal;
    if (Math.abs(diff) < 0.005) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(startVal + diff * eased);
      if (p < 1) raf = requestAnimationFrame(step);
      else setDisplay(value);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span className={className}>{format(display)}</span>;
}

export function monthPacePercent(month: string): number {
  const cur = today();
  if (!month || month === cur.slice(0, 7)) {
    const [y, m, d] = cur.split("-").map(Number);
    if (!y || !m || !d) return 50;
    const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
    return Math.min(100, Math.max(5, Math.round((d / daysInMonth) * 100)));
  }
  return month < cur.slice(0, 7) ? 100 : 15;
}
