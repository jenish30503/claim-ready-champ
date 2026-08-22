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
    proof: { receipt: "available", warrantyCard: "available", serialPhoto: "available" },
  },
];

export const sortedProducts = [...products].sort((a, b) => a.daysLeft - b.daysLeft);

export const totalProtectedValue = 166380;

export const samsung = products.find((p) => p.id === "samsung-tv")!;

export const formatINR = (value: number) => `₹${value.toLocaleString("en-IN")}`;

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
