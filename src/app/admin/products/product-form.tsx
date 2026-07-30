"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, qrra } from "@/lib/supabase/client";
import type { ColorGroup } from "@/data/products";

type ProductFormValues = {
  id?: string;
  slug: string;
  name: string;
  price: number;
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
};

const groups: ColorGroup[] = ["acid", "signal", "black", "cold", "heat"];

export function ProductForm({ initial }: { initial?: ProductFormValues }) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>(
    initial ?? {
      slug: "",
      name: "",
      price: 8900,
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
    },
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set<K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const payload = {
      slug: values.slug.trim(),
      name: values.name.trim(),
      price: Number(values.price),
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
      updated_at: new Date().toISOString(),
    };

    const supabase = createClient();
    const db = qrra(supabase);
    const { error: err } = values.id
      ? await db.from("products").update(payload).eq("id", values.id)
      : await db.from("products").insert(payload);

    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  const field = (
    key: keyof ProductFormValues,
    label: string,
    opts?: { type?: string; textarea?: boolean },
  ) => (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-mute">
        {label}
      </span>
      {opts?.textarea ? (
        <textarea
          value={String(values[key] ?? "")}
          onChange={(e) => set(key, e.target.value as ProductFormValues[typeof key])}
          rows={3}
          className="mt-2 w-full border-2 border-ink bg-paper px-3 py-2 outline-none focus:bg-acid/20"
        />
      ) : (
        <input
          type={opts?.type ?? "text"}
          value={String(values[key] ?? "")}
          onChange={(e) =>
            set(
              key,
              (opts?.type === "number"
                ? Number(e.target.value)
                : e.target.value) as ProductFormValues[typeof key],
            )
          }
          className="mt-2 w-full border-2 border-ink bg-paper px-3 py-2 outline-none focus:bg-acid/20"
        />
      )}
    </label>
  );

  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-4 sm:grid-cols-2">
      {field("name", "Название")}
      {field("slug", "Slug")}
      {field("price", "Цена", { type: "number" })}
      {field("color", "Цвет")}
      {field("lens", "Линзы")}
      {field("vibe", "Vibe")}
      <div className="sm:col-span-2">{field("description", "Описание", { textarea: true })}</div>
      {field("accent", "Accent")}
      {field("frame", "Frame")}
      {field("tags", "Теги (через запятую)")}
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wider text-mute">
          Группа
        </span>
        <select
          value={values.color_group}
          onChange={(e) => set("color_group", e.target.value as ColorGroup)}
          className="mt-2 w-full border-2 border-ink bg-paper px-3 py-2 outline-none"
        >
          {groups.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </label>
      {field("fit", "Fit")}
      {field("fit_note", "Fit note")}
      {field("material", "Материал")}
      {field("weight", "Вес")}
      {field("uv", "UV")}
      {field("warranty", "Гарантия")}
      <div className="sm:col-span-2">{field("care", "Уход", { textarea: true })}</div>
      <label className="flex items-center gap-2 sm:col-span-2">
        <input
          type="checkbox"
          checked={values.is_active}
          onChange={(e) => set("is_active", e.target.checked)}
        />
        <span className="text-sm font-bold">Активен</span>
      </label>
      {error ? (
        <p className="sm:col-span-2 text-sm font-bold text-signal">{error}</p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        data-cursor="hover"
        className="border-2 border-ink bg-ink px-6 py-3 text-xs font-extrabold uppercase tracking-[0.14em] text-paper hover:bg-signal disabled:opacity-60 sm:col-span-2 sm:w-fit"
      >
        {loading ? "…" : "Сохранить"}
      </button>
    </form>
  );
}
