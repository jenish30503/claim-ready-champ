import { useSyncExternalStore } from "react";

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
