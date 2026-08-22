import { useSyncExternalStore } from "react";

export type ProofState = "available" | "missing";

export type Product = {
  id: string;
  brand: string;
  name: string;
  category: string;
  value: number;
  daysLeft: number;
  purchaseDate: string;
  warrantyEnd: string;
  serialNumber: string;
  documents: { name: string; kind: string }[];
  covered: string[];
  notCovered: string[];
  proof: {
    receipt: ProofState;
    warrantyCard: ProofState;
    serialPhoto: ProofState;
  };
};

export const products: Product[] = [
  {
    id: "lg-washer",
    brand: "LG",
    name: "LG Washing Machine",
    category: "Front-load washer, 7 kg",
    value: 38500,
    daysLeft: 7,
    purchaseDate: "14 March 2025",
    warrantyEnd: "13 March 2027",
    serialNumber: "LG7KG-8821-IN",
    documents: [{ name: "lg-washer-invoice.pdf", kind: "Invoice / Receipt" }],
    covered: ["Motor and drum assembly", "Control board faults", "On-site technician visit"],
    notCovered: ["Rubber gasket wear", "Damage from hard water", "Unauthorized repairs"],
    proof: { receipt: "available", warrantyCard: "missing", serialPhoto: "missing" },
  },
  {
    id: "samsung-tv",
    brand: "Samsung",
    name: "Samsung 55-inch QLED TV",
    category: "QLED 55-inch TV",
    value: 72990,
    daysLeft: 18,
    purchaseDate: "9 September 2025",
    warrantyEnd: "8 September 2027",
    serialNumber: "SN55Q70-IN-4419",
    documents: [
      { name: "samsung-tv-invoice.pdf", kind: "Invoice / Receipt" },
      { name: "samsung-warranty-card.jpg", kind: "Warranty card" },
    ],
    covered: ["Panel and backlight faults", "Main board replacement", "In-home service"],
    notCovered: ["Physical / liquid damage", "Burn-in from static images", "Third-party wall mounts"],
    proof: { receipt: "available", warrantyCard: "available", serialPhoto: "missing" },
  },
  {
    id: "airpods",
    brand: "Apple",
    name: "Apple AirPods Pro",
    category: "Wireless earbuds",
    value: 24900,
    daysLeft: 142,
    purchaseDate: "2 January 2026",
    warrantyEnd: "1 January 2027",
    serialNumber: "G6Y2L8KQP7",
    documents: [
      { name: "airpods-pro-invoice.pdf", kind: "Invoice / Receipt" },
      { name: "apple-limited-warranty.pdf", kind: "Warranty card" },
    ],
    covered: ["Manufacturing defects", "Battery service if below spec", "Charging case hardware"],
    notCovered: ["Lost earbuds", "Ear-tip wear", "Water damage beyond IP rating"],
    proof: { receipt: "available", warrantyCard: "available", serialPhoto: "available" },
  },
  {
    id: "sony-xm5",
    brand: "Sony",
    name: "Sony WH-1000XM5 Headphones",
    category: "Over-ear headphones",
    value: 29990,
    daysLeft: 260,
    purchaseDate: "20 May 2026",
    warrantyEnd: "19 May 2027",
    serialNumber: "XM5-IN-204418",
    documents: [
      { name: "sony-xm5-invoice.pdf", kind: "Invoice / Receipt" },
      { name: "sony-warranty-card.jpg", kind: "Warranty card" },
    ],
    covered: ["Drivers and ANC hardware", "Headband hinge defects", "Carry-in service"],
    notCovered: ["Ear-cushion wear", "Cable accessories", "Drops and crush damage"],
    proof: { receipt: "available", warrantyCard: "available", serialPhoto: "available" },
  },
];

export const sortedProducts = [...products].sort((a, b) => a.daysLeft - b.daysLeft);

export const totalProtectedValue = 166380;

export const samsung = products.find((p) => p.id === "samsung-tv")!;

export const getProduct = (id?: string) => products.find((p) => p.id === id) ?? samsung;

export const formatINR = (value: number) => `₹${value.toLocaleString("en-IN")}`;

export function resolvedProof(p: Product, serialAdded: boolean) {
  const serialPhoto: ProofState =
    p.id === "samsung-tv" && serialAdded ? "available" : p.proof.serialPhoto;
  return { receipt: p.proof.receipt, warrantyCard: p.proof.warrantyCard, serialPhoto };
}

export function proofCount(p: Product, serialAdded: boolean) {
  return Object.values(resolvedProof(p, serialAdded)).filter((s) => s === "available").length;
}

export const warrantyClause =
  "Warranty Requirement 4.2: To process a service claim, the customer must provide a clear photograph of the product serial number label.";

export const claimEmail = `To: support@samsung.co.in
Subject: Service claim — Samsung QLED 55-inch TV (Display flickering)

Hello Samsung Support Team,

I am raising a service claim for my Samsung QLED 55-inch TV, purchased on 9 September 2025 for ₹72,990. The product is under warranty until 8 September 2027.

Issue: Display flickering / image issue, which started 3 days ago.

Attached, please find my complete case file:
1. Purchase invoice
2. Warranty card
3. Fault photo/video of the flickering display
4. Photograph of the product serial number label (as per Warranty Requirement 4.2)

Please confirm the claim reference number and arrange a technician visit at the earliest.

Thank you,
Jenish Chaudhary`;

/* ---- tiny client store for the demo's serial-photo upload ---- */

let serialPhotoAdded = false;
const listeners = new Set<() => void>();

export const addSerialPhoto = () => {
  serialPhotoAdded = true;
  listeners.forEach((l) => l());
};

export const resetSerialPhoto = () => {
  serialPhotoAdded = false;
  listeners.forEach((l) => l());
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useSerialPhotoAdded = () =>
  useSyncExternalStore(
    subscribe,
    () => serialPhotoAdded,
    () => false,
  );

/* ---- expiry reminders (demo, this device only) ---- */

const REMINDER_KEY = "warranty-tracker-reminders";
const reminderListeners = new Set<() => void>();
let reminderIds = new Set<string>();
const emptyReminders = new Set<string>();

function persistReminders() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REMINDER_KEY, JSON.stringify([...reminderIds]));
}

function readReminders() {
  if (typeof window === "undefined") return new Set<string>();
  try {
    const raw = window.localStorage.getItem(REMINDER_KEY);
    return new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set<string>();
  }
}

if (typeof window !== "undefined") {
  reminderIds = readReminders();
}

export const toggleReminder = (id: string) => {
  const next = new Set(reminderIds);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  reminderIds = next;
  persistReminders();
  reminderListeners.forEach((l) => l());
};

const subscribeReminders = (l: () => void) => {
  reminderListeners.add(l);
  return () => reminderListeners.delete(l);
};

export const useReminders = () =>
  useSyncExternalStore(
    subscribeReminders,
    () => reminderIds,
    () => emptyReminders,
  );
