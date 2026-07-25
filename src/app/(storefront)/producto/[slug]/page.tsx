import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/product-detail";
import { getProductBySlug } from "@/lib/queries/products";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <div className="flex-1 px-6 py-10 sm:px-10">
      <ProductDetail product={product} />
    </div>
  );
}
