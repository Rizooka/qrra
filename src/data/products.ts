export type ColorGroup = "acid" | "signal" | "black" | "cold" | "heat";

export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  sale_price?: number | null;
  sale_starts_at?: string | null;
  sale_ends_at?: string | null;
  cost_price?: number | null;
  color: string;
  lens: string;
  vibe: string;
  description: string;
  accent: string;
  frame: string;
  tags: string[];
  colorGroup: ColorGroup;
  fit: "one-size";
  fitNote: string;
  specs: {
    material: string;
    weight: string;
    uv: string;
    warranty: string;
  };
  care: string;
  isActive?: boolean;
  stock?: number;
  images?: string[];
};

export const products: Product[] = [
  {
    id: "1",
    slug: "stare-acid",
    name: "STARE ACID",
    price: 8900,
    color: "Кислотный",
    lens: "Зеркальный UV400",
    vibe: "Дневной вызов",
    description:
      "Квадратная оправа, которая не извиняется. Для тех, кто смотрит первым и не моргает.",
    accent: "#B8FF00",
    frame: "#111111",
    tags: ["acid", "day", "square"],
    colorGroup: "acid",
    fit: "one-size",
    fitNote: "Unisex. Средняя посадка. Сидит плотно — не просит прощения.",
    specs: {
      material: "Ацетат + сталь",
      weight: "28 г",
      uv: "UV400",
      warranty: "Lifetime",
    },
    care: "Протирай сухой тканью. Не оставляй на торпеде. Система не любит жару.",
  },
  {
    id: "2",
    slug: "signal-cut",
    name: "SIGNAL CUT",
    price: 9400,
    color: "Сигнальный",
    lens: "Дымчатый UV400",
    vibe: "Уличный удар",
    description:
      "Острый силуэт и оранжевый акцент. Выглядит как предупреждение — и работает как броня.",
    accent: "#FF3B00",
    frame: "#1A1A1A",
    tags: ["signal", "street", "sharp"],
    colorGroup: "signal",
    fit: "one-size",
    fitNote: "Unisex. Узкий мост. Для тех, кто режет кадр.",
    specs: {
      material: "Ацетат",
      weight: "26 г",
      uv: "UV400",
      warranty: "Lifetime",
    },
    care: "Храни в жёстком чехле. Сигнал не должен гнуться.",
  },
  {
    id: "3",
    slug: "blank-out",
    name: "BLANK OUT",
    price: 8200,
    color: "Чёрный мат",
    lens: "Чёрный UV400",
    vibe: "Тихий бунт",
    description:
      "Минимум деталей, максимум присутствия. Когда хочешь исчезнуть — и всё равно быть замеченным.",
    accent: "#2A2A2A",
    frame: "#0A0A0A",
    tags: ["black", "minimal", "night"],
    colorGroup: "black",
    fit: "one-size",
    fitNote: "Unisex. Классическая ширина. Тихий, но тяжёлый.",
    specs: {
      material: "Матовый ацетат",
      weight: "27 г",
      uv: "UV400",
      warranty: "Lifetime",
    },
    care: "Матовая поверхность — только мягкая ткань. Без химии.",
  },
  {
    id: "4",
    slug: "heatwave",
    name: "HEATWAVE",
    price: 9800,
    color: "Жар",
    lens: "Янтарный UV400",
    vibe: "Полуденный огонь",
    description:
      "Тёплые линзы и дерзкая геометрия. Солнце — не повод прятаться.",
    accent: "#FF6A00",
    frame: "#2B1408",
    tags: ["heat", "day", "amber"],
    colorGroup: "heat",
    fit: "one-size",
    fitNote: "Unisex. Чуть шире. Держит лицо на солнце.",
    specs: {
      material: "Ацетат",
      weight: "29 г",
      uv: "UV400",
      warranty: "Lifetime",
    },
    care: "Янтарь боится растворителей. Только вода и ткань.",
  },
  {
    id: "5",
    slug: "ice-dare",
    name: "ICE DARE",
    price: 9100,
    color: "Лёд",
    lens: "Голубой UV400",
    vibe: "Холодный взгляд",
    description:
      "Прозрачная оправа с ледяным оттенком. Смотришь сквозь — и всё равно давишь.",
    accent: "#7EC8FF",
    frame: "#C5D8E8",
    tags: ["cold", "clear", "ice"],
    colorGroup: "cold",
    fit: "one-size",
    fitNote: "Unisex. Лёгкая посадка. Холод без веса.",
    specs: {
      material: "Прозрачный ацетат",
      weight: "24 г",
      uv: "UV400",
      warranty: "Lifetime",
    },
    care: "Прозрачный ацетат царапается. Чехол обязателен.",
  },
  {
    id: "6",
    slug: "riot-rim",
    name: "RIOT RIM",
    price: 10500,
    color: "Riot",
    lens: "Зелёный UV400",
    vibe: "Ночной рейд",
    description:
      "Толстая оправа, невозможный цвет. Для тех, кто не спрашивает «можно ли».",
    accent: "#00E5A0",
    frame: "#0D1F18",
    tags: ["acid", "night", "thick"],
    colorGroup: "acid",
    fit: "one-size",
    fitNote: "Unisex. Толстый обод. Занимает пространство.",
    specs: {
      material: "Толстый ацетат",
      weight: "32 г",
      uv: "UV400",
      warranty: "Lifetime",
    },
    care: "Тяжёлая оправа — не бросай. Система не прощает падений.",
  },
  {
    id: "7",
    slug: "ghost-wire",
    name: "GHOST WIRE",
    price: 8700,
    color: "Призрак",
    lens: "Серебро UV400",
    vibe: "Невидимый удар",
    description:
      "Тонкий металл, почти невесомый. Появляется в кадре — и ломает композицию.",
    accent: "#D0D0D0",
    frame: "#8A8A8A",
    tags: ["cold", "metal", "minimal"],
    colorGroup: "cold",
    fit: "one-size",
    fitNote: "Unisex. Тонкий металл. Почти не чувствуешь — все видят.",
    specs: {
      material: "Нержавеющая сталь",
      weight: "18 г",
      uv: "UV400",
      warranty: "Lifetime",
    },
    care: "Металл — без соли и пота на ночь. Протирай после улицы.",
  },
  {
    id: "8",
    slug: "punchline",
    name: "PUNCHLINE",
    price: 9900,
    color: "Панч",
    lens: "Розовый UV400",
    vibe: "Последнее слово",
    description:
      "Не милый розовый — розовый как удар. Финальный аккорд любой улицы.",
    accent: "#FF4FA3",
    frame: "#1A0A12",
    tags: ["signal", "street", "punch"],
    colorGroup: "signal",
    fit: "one-size",
    fitNote: "Unisex. Средняя ширина. Финальный кадр.",
    specs: {
      material: "Ацетат",
      weight: "27 г",
      uv: "UV400",
      warranty: "Lifetime",
    },
    care: "Цвет держи в тени. Солнце выжигает панч.",
  },
];

export const filterGroups: { id: ColorGroup | "all"; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "acid", label: "Кислота" },
  { id: "signal", label: "Сигнал" },
  { id: "black", label: "Чёрный" },
  { id: "cold", label: "Холод" },
  { id: "heat", label: "Жар" },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getRelated(product: Product, limit = 4) {
  const scored = products
    .filter((p) => p.id !== product.id)
    .map((p) => {
      const shared = p.tags.filter((t) => product.tags.includes(t)).length;
      const sameGroup = p.colorGroup === product.colorGroup ? 2 : 0;
      return { p, score: shared + sameGroup };
    })
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.p);
}

export function formatPrice(price: number) {
  return `${new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
  }).format(price)} сум`;
}
