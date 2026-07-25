import { notFound } from "next/navigation";
import { ProductModal } from "@/components/product/product-modal";
import { ProductDetail } from "@/components/product/product-detail";
import { getProductBySlug } from "@/lib/queries/products";

// Intercepta la navegación por click a /producto/[slug] (viniendo de
// cualquier lado dentro de (storefront), como la home o una categoría) y la
// muestra como modal en vez de cambiar de página. Si se entra por URL
// directa o F5, Next.js ignora esto y renderiza la página completa de
// producto/[slug]/page.tsx normalmente — no hace falta código extra para eso.
export default async function ProductModalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <ProductModal>
      <ProductDetail product={product} />
    </ProductModal>
  );
}
