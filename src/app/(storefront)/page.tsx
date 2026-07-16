import { PromoCarousel } from "@/components/shared/promo-carousel";
import { CategorySection } from "@/components/product/category-section";
import { getActivePromotions } from "@/lib/queries/promotions";
import { getCategories, getFeaturedProductsByCategory } from "@/lib/queries/products";

export default async function Home() {
  const [promotions, categories] = await Promise.all([
    getActivePromotions(),
    getCategories(),
  ]);

  const sections = await Promise.all(
    categories.map(async (category) => ({
      category,
      products: await getFeaturedProductsByCategory(category.id),
    })),
  );

  return (
    <div className="flex flex-1 flex-col">
      <PromoCarousel promotions={promotions} />
      {sections.map(({ category, products }) => (
        <CategorySection key={category.id} category={category} products={products} />
      ))}
    </div>
  );
}
