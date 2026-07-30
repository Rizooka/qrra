"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { products, type Product } from "@/data/products";

type CartItem = {
  product: Product;
  qty: number;
};

type StoredItem = { product: Product; qty: number };

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  ready: boolean;
  add: (product: Product) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
};

const STORAGE_KEY = "qrra-cart-v2";
const CartContext = createContext<CartContextValue | null>(null);

function isProduct(value: unknown): value is Product {
  if (!value || typeof value !== "object") return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p.id === "string" &&
    typeof p.slug === "string" &&
    typeof p.name === "string" &&
    typeof p.price === "number"
  );
}

function loadStored(): StoredItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((row) => {
        if (!row || typeof row !== "object") return null;
        const r = row as { product?: unknown; qty?: unknown };
        if (!isProduct(r.product) || typeof r.qty !== "number" || r.qty <= 0) {
          return null;
        }
        const storedProduct = r.product;
        const fromStatic = products.find(
          (p) => p.slug === storedProduct.slug || p.id === storedProduct.id,
        );
        return {
          product: fromStatic
            ? { ...fromStatic, id: storedProduct.id, slug: storedProduct.slug }
            : storedProduct,
          qty: r.qty,
        };
      })
      .filter((x): x is StoredItem => Boolean(x));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(loadStored());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, i) => sum + i.qty, 0);
    const total = items.reduce((sum, i) => sum + i.product.price * i.qty, 0);

    return {
      items,
      count,
      total,
      ready,
      add: (product) => {
        setItems((prev) => {
          const existing = prev.find(
            (i) =>
              i.product.id === product.id || i.product.slug === product.slug,
          );
          if (existing) {
            return prev.map((i) =>
              i.product.id === existing.product.id
                ? { ...i, qty: i.qty + 1 }
                : i,
            );
          }
          return [...prev, { product, qty: 1 }];
        });
      },
      remove: (id) =>
        setItems((prev) => prev.filter((i) => i.product.id !== id)),
      setQty: (id, qty) => {
        if (qty <= 0) {
          setItems((prev) => prev.filter((i) => i.product.id !== id));
          return;
        }
        setItems((prev) =>
          prev.map((i) => (i.product.id === id ? { ...i, qty } : i)),
        );
      },
      clear: () => setItems([]),
    };
  }, [items, ready]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
