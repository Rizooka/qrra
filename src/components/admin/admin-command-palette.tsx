"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { QRRA } from "@/lib/db/tables";

type SearchResult = {
  id: string;
  type: "order" | "product" | "customer" | "page";
  title: string;
  subtitle: string;
  href: string;
};

const NAV_PAGES: SearchResult[] = [
  { id: "p-1", type: "page", title: "Обзор", subtitle: "Главная страница админки", href: "/admin" },
  { id: "p-2", type: "page", title: "Заказы", subtitle: "Управление заказами", href: "/admin/orders" },
  { id: "p-3", type: "page", title: "Товары", subtitle: "Каталог очков", href: "/admin/products" },
  { id: "p-4", type: "page", title: "Склад", subtitle: "Остатки и пополнение", href: "/admin/stock" },
  { id: "p-5", type: "page", title: "Поступления", subtitle: "Оприходование партий", href: "/admin/stock/receipts" },
  { id: "p-6", type: "page", title: "Промокоды", subtitle: "Управление скидочными кодами", href: "/admin/promo" },
  { id: "p-7", type: "page", title: "Аналитика", subtitle: "Выручка, конверсия, события", href: "/admin/analytics" },
  { id: "p-8", type: "page", title: "Клиенты", subtitle: "База покупателей", href: "/admin/customers" },
];

export function AdminCommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>(NAV_PAGES);
  const [loading, setLoading] = useState(false);

  // Keybindings listener: Cmd+K / Ctrl+K and 'g' navigation shortcuts
  useEffect(() => {
    let lastKey = "";
    let lastKeyTime = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in form fields
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isInput = tag === "input" || tag === "textarea" || tag === "select";

      // Cmd+K or Ctrl+K to toggle modal
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      if (isOpen) {
        if (e.key === "Escape") {
          setIsOpen(false);
        }
        return;
      }

      if (isInput) return;

      // 'g' key sequence shortcuts
      const now = Date.now();
      const key = e.key.toLowerCase();

      if (lastKey === "g" && now - lastKeyTime < 800) {
        if (key === "o") { e.preventDefault(); router.push("/admin/orders"); }
        if (key === "p") { e.preventDefault(); router.push("/admin/products"); }
        if (key === "s") { e.preventDefault(); router.push("/admin/stock"); }
        if (key === "a") { e.preventDefault(); router.push("/admin/analytics"); }
        if (key === "c") { e.preventDefault(); router.push("/admin/customers"); }
        if (key === "r") { e.preventDefault(); router.push("/admin/stock/receipts"); }
        lastKey = "";
        return;
      }

      if (key === "g") {
        lastKey = "g";
        lastKeyTime = now;
      } else {
        lastKey = "";
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, router]);

  // Perform search when query changes
  useEffect(() => {
    if (!query.trim()) {
      setResults(NAV_PAGES);
      return;
    }

    const q = query.trim().toLowerCase();
    const matchedPages = NAV_PAGES.filter(
      (p) => p.title.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q),
    );

    setLoading(true);
    const supabase = createClient();

    const fetchSearch = async () => {
      const [{ data: prods }, { data: ords }, { data: custs }] = await Promise.all([
        supabase.from(QRRA.products).select("id, name, slug").ilike("name", `%${q}%`).limit(4),
        supabase.from(QRRA.orders).select("id, total, status, created_at").ilike("id", `%${q}%`).limit(4),
        supabase.from(QRRA.profiles).select("id, full_name, email").or(`full_name.ilike.%${q}%,email.ilike.%${q}%`).limit(4),
      ]);

      const dynamicResults: SearchResult[] = [];

      (prods ?? []).forEach((p) => {
        dynamicResults.push({
          id: p.id,
          type: "product",
          title: p.name,
          subtitle: `Товар · ${p.slug}`,
          href: `/admin/products/${p.id}`,
        });
      });

      (ords ?? []).forEach((o) => {
        dynamicResults.push({
          id: o.id,
          type: "order",
          title: `Заказ #${o.id.slice(0, 8).toUpperCase()}`,
          subtitle: `${o.total.toLocaleString("ru-RU")} сум · статус: ${o.status}`,
          href: `/admin/orders/${o.id}`,
        });
      });

      (custs ?? []).forEach((c) => {
        dynamicResults.push({
          id: c.id,
          type: "customer",
          title: c.full_name || "Клиент",
          subtitle: c.email || c.id,
          href: `/admin/customers/${c.id}`,
        });
      });

      setResults([...matchedPages, ...dynamicResults]);
      setLoading(false);
    };

    const timer = setTimeout(() => {
      void fetchSearch();
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const selectItem = (href: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(href);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-ink/70 p-4 pt-20 backdrop-blur-sm">
      <div className="w-full max-w-xl border-2 border-ink bg-paper shadow-[8px_8px_0_#0c0c0c] overflow-hidden">
        {/* Search Input */}
        <div className="relative border-b-2 border-ink p-4">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Быстрый поиск заказов, товаров, клиентов... (Cmd+K / Ctrl+K)"
            className="w-full bg-paper pr-8 font-bold text-base outline-none"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black uppercase text-mute">
            ESC
          </span>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto divide-y divide-ink/10 p-2">
          {loading && (
            <p className="px-4 py-3 text-xs text-mute">Поиск...</p>
          )}

          {!loading && results.map((item) => (
            <button
              key={`${item.type}-${item.id}`}
              type="button"
              onClick={() => selectItem(item.href)}
              className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-acid/30"
            >
              <div>
                <p className="font-bold text-sm text-ink">{item.title}</p>
                <p className="text-xs text-mute">{item.subtitle}</p>
              </div>
              <span className="border border-ink/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-paper">
                {item.type === "page" ? "Раздел" : item.type === "order" ? "Заказ" : item.type === "product" ? "Товар" : "Клиент"}
              </span>
            </button>
          ))}

          {!loading && results.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-mute">
              Ничего не найдено по запросу «{query}»
            </p>
          )}
        </div>

        {/* Keyboard hints footer */}
        <div className="border-t-2 border-ink bg-ink/5 px-4 py-2 text-[10px] font-bold text-mute uppercase tracking-wider flex items-center justify-between">
          <span>Подсказки: <code>g o</code> заказы · <code>g p</code> товары · <code>g s</code> склад</span>
          <span>Cmd+K</span>
        </div>
      </div>
    </div>
  );
}
