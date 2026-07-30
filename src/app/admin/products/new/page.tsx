import { ProductForm } from "../product-form";

export const metadata = { title: "Новый товар — Admin QRRA" };

export default function NewProductPage() {
  return (
    <section className="bg-paper pt-10">
      <div className="mx-auto max-w-[800px] px-4 pb-24 sm:px-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-black tracking-tight">
          Новый товар
        </h1>
        <ProductForm />
      </div>
    </section>
  );
}
