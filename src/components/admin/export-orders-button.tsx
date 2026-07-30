"use client";

export function ExportOrdersButton() {
  return (
    <a
      href="/api/admin/orders"
      download
      data-cursor="hover"
      className="border-2 border-ink bg-paper px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] hover:bg-acid"
    >
      CSV экспорт
    </a>
  );
}
