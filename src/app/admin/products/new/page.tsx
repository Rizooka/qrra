import { AdminPageHeader } from "@/components/admin/page-header";
import { ProductForm } from "../product-form";

export const metadata = { title: "Новый товар — QRRA" };

export default function NewProductPage() {
  return (
    <div>
      <AdminPageHeader
        title="Новый товар"
        description="Поля совпадают с карточкой в магазине."
      />
      <div className="px-4 pb-16 sm:px-8">
        <ProductForm />
      </div>
    </div>
  );
}
