import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Categorías definidas para la beta (ver sección 9 del brief).
const categories = [
  { name: "iPhone usados", slug: "iphone-usados", order: 0 },
  { name: "Mac, iPad y Apple Watch usados", slug: "apple-usados", order: 1 },
  { name: "Audio", slug: "audio", order: 2 },
  { name: "Consolas y gaming", slug: "gaming", order: 3 },
] as const;

// Productos de prueba para poder construir y probar el storefront (paso 4)
// antes de tener carga real desde el panel admin (paso 6).
const sampleProducts = [
  {
    categorySlug: "iphone-usados",
    name: "iPhone 13 128GB",
    slug: "iphone-13-128gb",
    description:
      "iPhone 13 usado en excelente estado, batería 88%. Incluye cargador.",
    price: 650000,
    images: [],
    isUsed: true,
    condition: "A",
  },
  {
    categorySlug: "iphone-usados",
    name: "iPhone 12 mini 64GB",
    slug: "iphone-12-mini-64gb",
    description: "iPhone 12 mini usado, algunas marcas de uso en el borde.",
    price: 480000,
    images: [],
    isUsed: true,
    condition: "B",
  },
  {
    categorySlug: "apple-usados",
    name: 'MacBook Air M1 13"',
    slug: "macbook-air-m1-13",
    description: "MacBook Air M1 usada, 8GB RAM / 256GB SSD.",
    price: 1100000,
    images: [],
    isUsed: true,
    condition: "A",
  },
  {
    categorySlug: "audio",
    name: "Sony WH-1000XM5",
    slug: "sony-wh-1000xm5",
    description: "Auriculares Sony con cancelación de ruido, sellados.",
    price: 420000,
    images: [],
    isUsed: false,
    quantity: 5,
  },
  {
    categorySlug: "gaming",
    name: "PlayStation 5 Slim",
    slug: "playstation-5-slim",
    description: "Consola PlayStation 5 Slim, sellada de fábrica.",
    price: 950000,
    images: [],
    isUsed: false,
    quantity: 3,
  },
];

// Promociones de prueba para el carrusel de la home. Las imágenes son
// placeholders locales (public/promo-placeholder-*.svg); se reemplazan por
// las que cargue el admin en el paso 6.
const now = new Date();
const oneYear = 1000 * 60 * 60 * 24 * 365;
const samplePromotions = [
  {
    title: "iPhone usados",
    image: "/promo-placeholder-1.svg",
    link: "/categoria/iphone-usados",
    order: 0,
    activeFrom: new Date(now.getTime() - oneYear),
    activeTo: new Date(now.getTime() + oneYear),
  },
  {
    title: "Audio y gaming",
    image: "/promo-placeholder-2.svg",
    link: "/categoria/gaming",
    order: 1,
    activeFrom: new Date(now.getTime() - oneYear),
    activeTo: new Date(now.getTime() + oneYear),
  },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, order: category.order },
      create: category,
    });
  }

  for (const product of sampleProducts) {
    const { categorySlug, ...data } = product;
    const category = await prisma.category.findUniqueOrThrow({
      where: { slug: categorySlug },
    });
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: { ...data, categoryId: category.id },
      create: { ...data, categoryId: category.id },
    });
  }

  // Promotion no tiene un campo único además del id: para que el seed sea
  // idempotente, simplemente reemplazamos todas las promociones de prueba.
  await prisma.promotion.deleteMany({});
  await prisma.promotion.createMany({ data: samplePromotions });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
