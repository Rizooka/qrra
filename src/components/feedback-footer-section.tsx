"use client";

import { FeedbackPanel } from "@/components/feedback-panel";

export function FeedbackFooterSection() {
  return (
    <div className="border-t border-paper/15 px-4 py-10 sm:px-6 lg:px-10">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-acid">
        Влияй на каталог
      </p>
      <p className="mt-2 max-w-lg text-sm text-paper/70">
        Пожелания, идеи моделей и рекомендации — мы читаем всё в админке и
        используем для следующих дропов.
      </p>
      <FeedbackPanel variant="ink" title="Оставить пожелание" />
    </div>
  );
}
