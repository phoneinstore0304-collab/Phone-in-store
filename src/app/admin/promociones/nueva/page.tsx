import { PromotionForm } from "@/components/admin/promotion-form";
import { createPromotion } from "../actions";

export default function NewPromotionPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Nueva promoción</h1>
      <PromotionForm action={createPromotion} />
    </div>
  );
}
