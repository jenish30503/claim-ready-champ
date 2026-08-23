import { useQuery } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { queryClient } from "../router";
import { useSyncExternalStore } from "react";

export type ProofState = "available" | "missing";

export type Product = {
  id: string;
  brand: string;
  name: string;
  model: string;
  category: string;
  seller: string;
  warrantyProvider: string;
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

// Fallback empty array
const emptyProducts: Product[] = [];

export const useProducts = () => {
  const { data } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase
        .from("products")
        .select("data")
        .order("created_at", { ascending: false });
        
      if (error) {
        console.error("Failed to fetch products", error);
        return [];
      }
      return data.map((row) => row.data as Product);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  return data ?? emptyProducts;
};

export const addProduct = async (p: Product) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  // Optimistic update
  queryClient.setQueryData(["products"], (old: Product[] | undefined) => {
    return [p, ...(old ?? [])];
  });

  const { error } = await supabase.from("products").insert({
    user_id: session.user.id,
    data: p
  });

  if (error) {
    console.error("Failed to add product", error);
    queryClient.invalidateQueries({ queryKey: ["products"] });
  }
};

export const updateProduct = async (p: Product) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  // Optimistic update
  queryClient.setQueryData(["products"], (old: Product[] | undefined) => {
    return (old ?? []).map(existing => existing.id === p.id ? p : existing);
  });

  // To update by ID in a JSONB structure without a dedicated column for product id, 
  // we would ideally need a separate id column. However, we can use a raw update 
  // query if we know the supabase setup, or just do a delete+insert or match data->>'id'.
  // Assuming 'data->>id' works in Supabase:
  const { error } = await supabase
    .from("products")
    .update({ data: p })
    .eq("user_id", session.user.id)
    .eq("data->>id", p.id);

  if (error) {
    console.error("Failed to update product", error);
    queryClient.invalidateQueries({ queryKey: ["products"] });
  }
};

export const deleteProduct = async (id: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  // Optimistic update
  queryClient.setQueryData(["products"], (old: Product[] | undefined) => {
    return (old ?? []).filter(existing => existing.id !== id);
  });

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("user_id", session.user.id)
    .eq("data->>id", id);

  if (error) {
    console.error("Failed to delete product", error);
    queryClient.invalidateQueries({ queryKey: ["products"] });
  }
};

// Fallback dummy for missing product to avoid crashes during transitions
const fallbackProduct: Product = {
  id: "fallback",
  brand: "Unknown",
  name: "Loading...",
  model: "",
  category: "",
  seller: "",
  warrantyProvider: "",
  value: 0,
  daysLeft: 0,
  purchaseDate: "",
  warrantyEnd: "",
  serialNumber: "",
  documents: [],
  covered: [],
  notCovered: [],
  proof: { receipt: "missing", warrantyCard: "missing", serialPhoto: "missing" },
};

export const useProduct = (id?: string) => {
  const products = useProducts();
  return products.find((p) => p.id === id) ?? fallbackProduct;
};

export const formatINR = (value: number) => `₹${value.toLocaleString("en-IN")}`;

export function resolvedProof(p: Product, serialAdded: boolean) {
  const serialPhoto: ProofState =
    p.id === "samsung-tv" && serialAdded ? "available" : p.proof.serialPhoto;
  return { receipt: p.proof.receipt, warrantyCard: p.proof.warrantyCard, serialPhoto };
}

export function proofCount(p: Product, serialAdded: boolean) {
  return Object.values(resolvedProof(p, serialAdded)).filter((s) => s === "available").length;
}

export function claimReadinessScore(p: Product, serialAdded: boolean) {
  const count = proofCount(p, serialAdded);
  return Math.round((count / 3) * 100);
}

export {
  addSerialPhoto,
  claimEmail,
  resetSerialPhoto,
  useSerialPhotoAdded,
  warrantyClause,
} from "./warranty-store";

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
    if (raw) {
      return new Set<string>(JSON.parse(raw) as string[]);
    }
    const defaultReminders = new Set<string>();
    window.localStorage.setItem(REMINDER_KEY, JSON.stringify([...defaultReminders]));
    return defaultReminders;
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
