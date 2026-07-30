"use client";

import Image from "next/image";
import { useState } from "react";
import { QRRA } from "@/lib/db/tables";
import { PRODUCT_PHOTOS_BUCKET } from "@/lib/catalog/product-stock";
import { createClient } from "@/lib/supabase/client";

export function ProductImageUpload({
  productId,
  slug,
  images,
  onChange,
}: {
  productId?: string;
  slug: string;
  images: string[];
  onChange: (urls: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const onFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    setError("");
    const supabase = createClient();
    const folder = productId ?? (slug.trim() || "new");
    const next = [...images];

    try {
      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) {
          setError("Файл больше 5 МБ");
          continue;
        }
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from(PRODUCT_PHOTOS_BUCKET)
          .upload(path, file, { upsert: true, contentType: file.type });
        if (upErr) {
          setError("Не удалось загрузить фото");
          continue;
        }
        const { data } = supabase.storage
          .from(PRODUCT_PHOTOS_BUCKET)
          .getPublicUrl(path);
        if (data.publicUrl) next.push(data.publicUrl);
      }
      onChange(next);
    } catch {
      setError("Не удалось загрузить фото");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeAt = (i: number) => {
    onChange(images.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {images.map((url, i) => (
          <div key={url} className="relative h-20 w-20 border-2 border-ink">
            <Image src={url} alt="" fill className="object-cover" sizes="80px" />
            <button
              type="button"
              className="absolute right-0 top-0 bg-signal px-1 text-[10px] font-bold text-paper"
              onClick={() => removeAt(i)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wider text-mute">
          Фото товара
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          disabled={uploading || !slug.trim()}
          onChange={onFiles}
          className="mt-2 block w-full text-sm"
        />
      </label>
      {!slug.trim() ? (
        <p className="text-xs text-mute">Сначала укажи код модели (slug).</p>
      ) : null}
      {uploading ? <p className="text-xs font-bold">Загрузка…</p> : null}
      {error ? <p className="text-xs font-bold text-signal">{error}</p> : null}
    </div>
  );
}
