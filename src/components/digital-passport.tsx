"use client";

import { useSound } from "@/components/sound-provider";
import { useEffect, useRef, useState } from "react";

type DigitalPassportProps = {
  orderId: string;
  customerName: string;
  total: number;
  isGuest: boolean;
};

export function DigitalPassport({
  orderId,
  customerName,
  total,
  isGuest,
}: DigitalPassportProps) {
  const { playAdd } = useSound();
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const shortId = orderId ? orderId.slice(0, 8).toUpperCase() : "QRRA-8888";
  const dateStr = new Date().toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  useEffect(() => {
    playAdd();
  }, [playAdd]);

  const copyId = () => {
    navigator.clipboard.writeText(`QRRA-${shortId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-8 flex flex-col items-center">
      <div
        ref={cardRef}
        className="relative w-full max-w-md overflow-hidden border-4 border-paper bg-ink p-6 text-left text-paper shadow-[8px_8px_0_#B8FF00]"
      >
        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-signal/20 blur-xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-paper/20 pb-4">
          <div>
            <p className="font-[family-name:var(--font-display)] text-xs font-black tracking-[0.18em] text-acid uppercase">
              ЭЛЕКТРОННЫЙ ПАСПОРТ ВЛАДЕЛЬЦА
            </p>
            <p className="mt-0.5 text-[10px] font-mono uppercase tracking-wider text-paper/60">
              QRRA WEARER PASSPORT // OFFICIAL ID
            </p>
          </div>
          <span className="border border-acid bg-acid/10 px-2 py-1 font-mono text-[10px] font-bold text-acid uppercase tracking-widest">
            ПОДТВЕРЖДЕНО
          </span>
        </div>

        {/* Body */}
        <div className="mt-5 space-y-4 font-sans text-xs">
          <div>
            <span className="block font-mono text-[9px] uppercase tracking-wider text-paper/50">
              ВЛАДЕЛЬЕЦ ЗАКАЗА
            </span>
            <span className="text-sm font-black uppercase text-paper tracking-wider">
              {customerName || "СМОТРЯЩИЙ ПЕРВЫМ"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block font-mono text-[9px] uppercase tracking-wider text-paper/50">
                НОМЕР ЗАКАЗА
              </span>
              <span className="font-mono font-bold text-acid tracking-wider">
                #{shortId}
              </span>
            </div>
            <div>
              <span className="block font-mono text-[9px] uppercase tracking-wider text-paper/50">
                ДАТА ОФОРМЛЕНИЯ
              </span>
              <span className="font-mono font-bold text-paper/90">{dateStr}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block font-mono text-[9px] uppercase tracking-wider text-paper/50">
                СТАТУС ДОСТАВКИ
              </span>
              <span className="font-bold text-signal">ОБРАБОТКА И СБОРКА</span>
            </div>
            <div>
              <span className="block font-mono text-[9px] uppercase tracking-wider text-paper/50">
                УРОВЕНЬ ДОСТУПА
              </span>
              <span className="font-bold text-acid">БЕЗ ИЗВИНЕНИЙ (UV400)</span>
            </div>
          </div>
        </div>

        {/* Decorative elements & Barcode simulation */}
        <div className="mt-6 flex items-end justify-between border-t border-paper/20 pt-4">
          <div className="flex h-7 items-end gap-1">
            {[14, 20, 8, 22, 12, 24, 10, 18, 20, 8, 24, 14, 18, 12].map((h, i) => (
              <span
                key={i}
                className="w-1 bg-paper/80"
                style={{ height: `${h}px` }}
              />
            ))}
          </div>
          <p className="font-[family-name:var(--font-display)] text-[10px] font-black tracking-widest text-paper/40">
            СМОТРИ ПЕРВЫМ.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={copyId}
        data-cursor="hover"
        className="mt-6 border-2 border-acid bg-acid/10 px-6 py-2.5 font-[family-name:var(--font-display)] text-xs font-bold uppercase tracking-[0.16em] text-acid transition-colors hover:bg-acid hover:text-ink"
      >
        {copied ? "ID Паспорта скопирован!" : "Скопировать номер паспорта"}
      </button>
    </div>
  );
}
