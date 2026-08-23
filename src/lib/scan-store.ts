import { useSyncExternalStore } from "react";

import type { Product, ProofState } from "./warranty-data";

export type ScannedProduct = Product & { scanned: true };

const KEY = "warranty-tracker-scanned";
const listeners = new Set<() => void>();
let scanned: ScannedProduct[] = [];
const empty: ScannedProduct[] = [];

function read(): ScannedProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ScannedProduct[]) : [];
  } catch {
    return [];
  }
}

if (typeof window !== "undefined") {
  scanned = read();
}

function emit() {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(scanned));
  }
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useScannedProducts = () =>
  useSyncExternalStore(
    subscribe,
    () => scanned,
    () => empty,
  );

export const addScannedProduct = (p: ScannedProduct) => {
  scanned = [p, ...scanned.filter((s) => s.id !== p.id)];
  emit();
};

export const removeScannedProduct = (id: string) => {
  scanned = scanned.filter((s) => s.id !== id);
  emit();
};

/* ---- helpers to turn scanned text into a vault product ---- */

export function parsePrice(price: string) {
  const digits = price.replace(/[^\d.]/g, "");
  const value = Number.parseFloat(digits);
  return Number.isFinite(value) ? Math.round(value) : 0;
}

export function daysUntil(dateText: string) {
  const parsed = new Date(dateText);
  if (Number.isNaN(parsed.getTime())) return 365;
  const diff = Math.ceil((parsed.getTime() - Date.now()) / 86_400_000);
  return diff;
}

export function buildScannedProduct(fields: {
  product: string;
  brand: string;
  date: string;
  price: string;
  category: string;
  serialNumber: string;
  warrantyTenure: string;
  expiryDate: string;
}): ScannedProduct {
  const serialPhoto: ProofState = fields.serialNumber.trim() ? "available" : "missing";
  return {
    id: `scan-${Date.now()}`,
    brand: fields.brand.trim() || "Scanned receipt",
    name: fields.product.trim() || "Untitled product",
    category: fields.category.trim() || "Other",
    value: parsePrice(fields.price),
    daysLeft: daysUntil(fields.expiryDate),
    purchaseDate: fields.date.trim() || "Not on receipt",
    warrantyEnd: fields.expiryDate.trim() || fields.warrantyTenure.trim() || "Not on receipt",
    serialNumber: fields.serialNumber.trim() || "Not on receipt",
    documents: [{ name: "scanned-receipt.jpg", kind: "Invoice / Receipt" }],
    covered: ["Manufacturing defects", "Functional failure within warranty tenure"],
    notCovered: ["Physical or liquid damage", "Unauthorized repairs"],
    proof: { receipt: "available", warrantyCard: "missing", serialPhoto },
    scanned: true,
  };
}
