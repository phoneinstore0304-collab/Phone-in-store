import { PromoCarousel } from "@/components/shared/promo-carousel";
import { Hero } from "@/components/shared/hero";
import { CategoryPills } from "@/components/product/category-pills";
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
      <Hero />
      <PromoCarousel promotions={promotions} />
      <CategoryPills categories={categories} />
      {sections.map(({ category, products }) => (
        <CategorySection key={category.id} category={category} products={products} />
      ))}
    </div>
  );
}
