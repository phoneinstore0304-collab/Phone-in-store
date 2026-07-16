import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PromotionForm } from "@/components/admin/promotion-form";
import { updatePromotion } from "../../actions";

export default async function EditPromotionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const promotion = await prisma.promotion.findUnique({ where: { id } });
  if (!promotion) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Editar promoción</h1>
      <PromotionForm action={updatePromotion.bind(null, id)} promotion={promotion} />
    </div>
  );
}
