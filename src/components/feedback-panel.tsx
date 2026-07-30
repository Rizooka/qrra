"use client";

import { useState } from "react";
import type { FeedbackKind } from "@/lib/analytics/event-names";
import { FEEDBACK_KIND_LABEL } from "@/lib/analytics/event-names";
import { submitFeedback } from "@/lib/analytics/submit-feedback";
import { track } from "@/lib/analytics/track";

const KINDS: FeedbackKind[] = ["wish", "product_idea", "recommendation"];

export function FeedbackPanel({
  productSlug,
  variant = "paper",
  title = "Скажи, что нужно",
}: {
  productSlug?: string;
  variant?: "paper" | "ink";
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<FeedbackKind>("wish");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [err, setErr] = useState("");

  const ink = variant === "ink";

  const onOpen = () => {
    setOpen(true);
    track({
      event: "wish_open",
      product_slug: productSlug,
      metadata: { surface: variant },
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErr("");
    const res = await submitFeedback({
      kind,
      message,
      email: email || undefined,
      product_slug: productSlug,
    });
    if (!res.ok) {
      setStatus("err");
      setErr(res.error);
      return;
    }
    setStatus("ok");
    setMessage("");
    setEmail("");
  };

  if (!open) {
    return (
      <button
        type="button"
        data-cursor="hover"
        onClick={onOpen}
        className={
          ink
            ? "mt-4 text-left text-sm font-bold uppercase tracking-wider text-acid underline underline-offset-4 hover:text-signal"
            : "border-2 border-ink bg-paper px-4 py-3 text-left text-sm font-bold uppercase tracking-wider hover:bg-acid/30"
        }
      >
        {title} →
      </button>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={
        ink
          ? "mt-4 space-y-3 border border-paper/25 p-4"
          : "mt-4 space-y-3 border-2 border-ink bg-paper p-4"
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-mute">
          {title}
        </p>
        <button
          type="button"
          className="text-xs font-bold uppercase tracking-wider underline"
          onClick={() => setOpen(false)}
        >
          Закрыть
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <button
            key={k}
            type="button"
            data-cursor="hover"
            onClick={() => setKind(k)}
            className={`border-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
              kind === k
                ? ink
                  ? "border-acid bg-acid text-ink"
                  : "border-ink bg-ink text-paper"
                : ink
                  ? "border-paper/30"
                  : "border-ink bg-paper"
            }`}
          >
            {FEEDBACK_KIND_LABEL[k]}
          </button>
        ))}
      </div>

      <label className="block">
        <span className="text-[10px] font-bold uppercase tracking-wider text-mute">
          Текст
        </span>
        <textarea
          required
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Цвет, модель, что улучшить, что не нашли…"
          className={
            ink
              ? "mt-1 w-full border border-paper/30 bg-ink px-3 py-2 text-sm outline-none focus:border-acid"
              : "mt-1 w-full border-2 border-ink bg-paper px-3 py-2 text-sm outline-none focus:bg-acid/20"
          }
        />
      </label>

      <label className="block">
        <span className="text-[10px] font-bold uppercase tracking-wider text-mute">
          Email (необязательно)
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={
            ink
              ? "mt-1 w-full border border-paper/30 bg-ink px-3 py-2 text-sm outline-none focus:border-acid"
              : "mt-1 w-full border-2 border-ink bg-paper px-3 py-2 text-sm outline-none focus:bg-acid/20"
          }
        />
      </label>

      {status === "err" ? (
        <p className="text-sm font-bold text-signal">{err}</p>
      ) : null}
      {status === "ok" ? (
        <p className="text-sm font-bold text-acid">Принято. Спасибо.</p>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading"}
        data-cursor="hover"
        className={
          ink
            ? "border-2 border-acid bg-acid px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-ink hover:bg-signal hover:border-signal hover:text-paper disabled:opacity-60"
            : "border-2 border-ink bg-signal px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-paper hover:bg-ink disabled:opacity-60"
        }
      >
        {status === "loading" ? "…" : "Отправить"}
      </button>
    </form>
  );
}
