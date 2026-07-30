"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/client";
import { ProductImageUpload } from "@/components/admin/product-image-upload";
import type { ColorGroup } from "@/data/products";

type ProductFormValues = {
  id?: string;
  slug: string;
  name: string;
  price: number;
  cost_price: number | null;
  sale_price: number | null;
  sale_starts_at: string;
  sale_ends_at: string;
  low_stock_threshold: number;
  color: string;
  lens: string;
  vibe: string;
  description: string;
  accent: string;
  frame: string;
  tags: string;
  color_group: ColorGroup;
  fit: string;
  fit_note: string;
  material: string;
  weight: string;
  uv: string;
  warranty: string;
  care: string;
  is_active: boolean;
  stock: number;
  images: string[];
};

const groups: ColorGroup[] = ["acid", "signal", "black", "cold", "heat"];

function Field({
  label,
  children,
  hint,
  span2 = false,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  span2?: boolean;
}) {
  return (
    <label className={`block${span2 ? " sm:col-span-2" : ""}`}>
      <span className="text-xs font-bold uppercase tracking-wider text-mute">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-mute/70">{hint}</span>}
    </label>
  );
}

const inp =
  "mt-2 w-full border-2 border-ink bg-paper px-3 py-2 outline-none focus:bg-acid/20";

function SectionHeader({ label, color = "text-signal" }: { label: string; color?: string }) {
  return (
    <p className={`text-xs font-bold uppercase tracking-[0.16em] ${color}`}>{label}</p>
  );
}

export function ProductForm({ initial }: { initial?: ProductFormValues }) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>(
    initial ?? {
      slug: "",
      name: "",
      price: 89000,
      cost_price: null,
      sale_price: null,
      sale_starts_at: "",
      sale_ends_at: "",
      low_stock_threshold: 3,
      color: "",
      lens: "UV400",
      vibe: "",
      description: "",
      accent: "#B8FF00",
      frame: "#111111",
      tags: "",
      color_group: "acid",
      fit: "one-size",
      fit_note: "Unisex.",
      material: "Ацетат",
      weight: "28 г",
      uv: "UV400",
      warranty: "Lifetime",
      care: "",
      is_active: true,
      stock: 10,
      images: [],
    },
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  // Check if sale is currently active
  const saleActive = Boolean(
    values.sale_price &&
    values.sale_price > 0 &&
    values.sale_price < values.price,
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      slug: values.slug.trim(),
      name: values.name.trim(),
      price: Number(values.price),
      cost_price: values.cost_price !== null && values.cost_price !== 0 ? Number(values.cost_price) : null,
      sale_price: values.sale_price !== null && values.sale_price !== 0 ? Number(values.sale_price) : null,
      sale_starts_at: values.sale_starts_at || null,
      sale_ends_at: values.sale_ends_at || null,
      low_stock_threshold: Number(values.low_stock_threshold) || 3,
      color: values.color,
      lens: values.lens,
      vibe: values.vibe,
      description: values.description,
      accent: values.accent,
      frame: values.frame,
      tags: values.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      color_group: values.color_group,
      fit: values.fit,
      fit_note: values.fit_note,
      specs: {
        material: values.material,
        weight: values.weight,
        uv: values.uv,
        warranty: values.warranty,
      },
      care: values.care,
      is_active: values.is_active,
      stock: Math.max(0, Number(values.stock)),
      images: values.images,
      updated_at: new Date().toISOString(),
    };

    const supabase = createClient();
    const { error: err } = values.id
      ? await supabase.from(QRRA.products).update(payload).eq("id", values.id)
      : await supabase.from(QRRA.products).insert(payload);

    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-6">

      {/* ── Основное ─────────────────────────────── */}
      <div className="border-2 border-ink p-5">
        <SectionHeader label="Основное" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Название">
            <input className={inp} value={values.name} onChange={(e) => set("name", e.target.value)} required />
          </Field>
          <Field label="Код модели (URL / slug)" hint="Только латиница и дефис, например: shadow-black">
            <input className={inp} value={values.slug} onChange={(e) => set("slug", e.target.value)} required />
          </Field>
          <Field label="Vibe (подзаголовок)">
            <input className={inp} value={values.vibe} onChange={(e) => set("vibe", e.target.value)} />
          </Field>
          <Field label="Цвет">
            <input className={inp} value={values.color} onChange={(e) => set("color", e.target.value)} />
          </Field>
          <Field label="Линзы">
            <input className={inp} value={values.lens} onChange={(e) => set("lens", e.target.value)} />
          </Field>
          <Field label="Описание" span2>
            <textarea
              className={inp}
              rows={3}
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </Field>
        </div>
      </div>

      {/* ── Цены ─────────────────────────────────── */}
      <div className="border-2 border-ink p-5">
        <div className="flex items-center justify-between">
          <SectionHeader label="Цены" />
          {saleActive && (
            <span className="bg-signal px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-paper">
              АКЦИЯ АКТИВНА
            </span>
          )}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Цена продажи (сум)" hint="Основная цена">
            <input
              type="number"
              min={0}
              className={inp}
              value={values.price}
              onChange={(e) => set("price", Number(e.target.value))}
              required
            />
          </Field>
          <Field label="Акционная цена (сум)" hint="Оставьте пустым если нет акции">
            <input
              type="number"
              min={0}
              className={`${inp} ${saleActive ? "border-signal bg-signal/10" : ""}`}
              value={values.sale_price ?? ""}
              onChange={(e) =>
                set("sale_price", e.target.value === "" ? null : Number(e.target.value))
              }
            />
          </Field>
          <Field label="Начало акции">
            <input
              type="datetime-local"
              className={inp}
              value={values.sale_starts_at}
              onChange={(e) => set("sale_starts_at", e.target.value)}
            />
          </Field>
          <Field label="Конец акции">
            <input
              type="datetime-local"
              className={inp}
              value={values.sale_ends_at}
              onChange={(e) => set("sale_ends_at", e.target.value)}
            />
          </Field>
          <Field label="Себестоимость (сум)" hint="Только для внутренней аналитики, клиенты не видят">
            <input
              type="number"
              min={0}
              className={inp}
              value={values.cost_price ?? ""}
              onChange={(e) =>
                set("cost_price", e.target.value === "" ? null : Number(e.target.value))
              }
            />
          </Field>
          {values.cost_price && values.cost_price > 0 && (
            <div className="flex flex-col justify-end">
              <span className="text-xs font-bold uppercase tracking-wider text-mute">Маржа</span>
              <p className="mt-2 font-[family-name:var(--font-display)] text-xl font-black tabular-nums">
                {Math.round(((values.price - values.cost_price) / values.price) * 100)}%
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Склад ────────────────────────────────── */}
      <div className="border-2 border-ink p-5">
        <SectionHeader label="Склад" />
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="Остаток (шт.)">
            <input
              type="number"
              min={0}
              className={inp}
              value={values.stock}
              onChange={(e) => set("stock", Number(e.target.value))}
            />
          </Field>
          <Field label="Порог «мало»" hint="При остатке ≤ N получишь уведомление">
            <input
              type="number"
              min={1}
              className={inp}
              value={values.low_stock_threshold}
              onChange={(e) => set("low_stock_threshold", Number(e.target.value))}
            />
          </Field>
          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => set("is_active", !values.is_active)}
                className={`relative h-6 w-11 rounded-full border-2 border-ink transition-colors ${
                  values.is_active ? "bg-acid" : "bg-mute/20"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full border-2 border-ink bg-paper transition-transform ${
                    values.is_active ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </div>
              <span className="text-sm font-bold">
                {values.is_active ? "Активен на витрине" : "Скрыт с витрины"}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* ── Фото ─────────────────────────────────── */}
      <div className="border-2 border-ink p-5">
        <SectionHeader label="Фото" />
        <div className="mt-4">
          <ProductImageUpload
            productId={values.id}
            slug={values.slug}
            images={values.images}
            onChange={(urls) => set("images", urls)}
          />
        </div>
      </div>

      {/* ── Визуал ───────────────────────────────── */}
      <div className="border-2 border-ink p-5">
        <SectionHeader label="Визуал (без фото)" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Accent (hex цвет)">
            <div className="flex gap-2">
              <input
                type="color"
                value={values.accent}
                onChange={(e) => set("accent", e.target.value)}
                className="mt-2 h-10 w-12 cursor-pointer border-2 border-ink bg-paper p-0.5"
              />
              <input
                className={`${inp} flex-1`}
                value={values.accent}
                onChange={(e) => set("accent", e.target.value)}
              />
            </div>
          </Field>
          <Field label="Frame (hex цвет)">
            <div className="flex gap-2">
              <input
                type="color"
                value={values.frame}
                onChange={(e) => set("frame", e.target.value)}
                className="mt-2 h-10 w-12 cursor-pointer border-2 border-ink bg-paper p-0.5"
              />
              <input
                className={`${inp} flex-1`}
                value={values.frame}
                onChange={(e) => set("frame", e.target.value)}
              />
            </div>
          </Field>
          <Field label="Теги (через запятую)">
            <input className={inp} value={values.tags} onChange={(e) => set("tags", e.target.value)} />
          </Field>
          <Field label="Группа">
            <select
              value={values.color_group}
              onChange={(e) => set("color_group", e.target.value as ColorGroup)}
              className={inp}
            >
              {groups.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      {/* ── Спеки ────────────────────────────────── */}
      <div className="border-2 border-ink p-5">
        <SectionHeader label="Спецификации и уход" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Посадка (fit)">
            <input className={inp} value={values.fit} onChange={(e) => set("fit", e.target.value)} />
          </Field>
          <Field label="Примечание к посадке">
            <input className={inp} value={values.fit_note} onChange={(e) => set("fit_note", e.target.value)} />
          </Field>
          <Field label="Материал">
            <input className={inp} value={values.material} onChange={(e) => set("material", e.target.value)} />
          </Field>
          <Field label="Вес">
            <input className={inp} value={values.weight} onChange={(e) => set("weight", e.target.value)} />
          </Field>
          <Field label="UV-защита">
            <input className={inp} value={values.uv} onChange={(e) => set("uv", e.target.value)} />
          </Field>
          <Field label="Гарантия">
            <input className={inp} value={values.warranty} onChange={(e) => set("warranty", e.target.value)} />
          </Field>
          <Field label="Уход за оправой" span2>
            <textarea
              className={inp}
              rows={2}
              value={values.care}
              onChange={(e) => set("care", e.target.value)}
            />
          </Field>
        </div>
      </div>

      {error && (
        <p className="border-2 border-signal bg-signal/10 px-4 py-3 text-sm font-bold text-signal">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loading}
          data-cursor="hover"
          className="border-2 border-ink bg-ink px-8 py-3 text-xs font-extrabold uppercase tracking-[0.14em] text-paper hover:bg-signal disabled:opacity-60"
        >
          {loading ? "Сохранение…" : "Сохранить товар"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="border-2 border-ink px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-acid/30"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}
