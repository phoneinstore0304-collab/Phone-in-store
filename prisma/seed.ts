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

// Fotos de stock (Unsplash, uso libre) para que el catálogo de prueba no se
// vea vacío. Son genéricas, no fotos reales de cada unidad — se reemplazan
// por las que suba el admin desde el panel (paso 6) o por Supabase Storage.
const stockPhoto = (id: string) =>
  `https://images.unsplash.com/photo-${id}?q=80&w=1200&auto=format&fit=crop`;

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
    images: [
      stockPhoto("1642227140165-534d29b48f70"),
      stockPhoto("1510557880182-3d4d3cba35a5"),
      stockPhoto("1523206489230-c012c64b2b48"),
    ],
    isUsed: true,
    condition: "A",
  },
  {
    categorySlug: "iphone-usados",
    name: "iPhone 12 mini 64GB",
    slug: "iphone-12-mini-64gb",
    description: "iPhone 12 mini usado, algunas marcas de uso en el borde.",
    price: 480000,
    images: [stockPhoto("1647232440941-e256293d25bb")],
    isUsed: true,
    condition: "B",
  },
  {
    categorySlug: "apple-usados",
    name: 'MacBook Air M1 13"',
    slug: "macbook-air-m1-13",
    description: "MacBook Air M1 usada, 8GB RAM / 256GB SSD.",
    price: 1100000,
    images: [stockPhoto("1504198070170-4ca53bb1c1fa")],
    isUsed: true,
    condition: "A",
  },
  {
    categorySlug: "audio",
    name: "Sony WH-1000XM5",
    slug: "sony-wh-1000xm5",
    description: "Auriculares Sony con cancelación de ruido, sellados.",
    price: 420000,
    images: [stockPhoto("1505740420928-5e560c06d30e")],
    isUsed: false,
    quantity: 5,
  },
  {
    categorySlug: "audio",
    name: "JBL Flip 6",
    slug: "jbl-flip-6",
    description: "Parlante Bluetooth JBL Flip 6, resistente al agua (IP67), sellado.",
    price: 210000,
    images: [stockPhoto("1608043152269-423dbba4e7e1")],
    isUsed: false,
    quantity: 8,
  },
  {
    categorySlug: "gaming",
    name: "PlayStation 5 Slim",
    slug: "playstation-5-slim",
    description: "Consola PlayStation 5 Slim, sellada de fábrica.",
    price: 950000,
    images: [stockPhoto("1750797308931-b0d261abb3d5")],
    isUsed: false,
    quantity: 3,
  },
];

// Banners reales de las redes de Phone in Store (public/promo/*.jpg).
const now = new Date();
const oneYear = 1000 * 60 * 60 * 24 * 365;
const samplePromotions = [
  {
    title: "Línea JBL — sumamos nuevos productos",
    image: "/promo/jbl.jpg",
    link: "/categoria/audio",
    order: 0,
    activeFrom: new Date(now.getTime() - oneYear),
    activeTo: new Date(now.getTime() + oneYear),
  },
  {
    title: "Apple Sale — iPad 11'' Chip M1 256GB",
    image: "/promo/ipad.jpg",
    link: "/categoria/apple-usados",
    order: 1,
    activeFrom: new Date(now.getTime() - oneYear),
    activeTo: new Date(now.getTime() + oneYear),
  },
  {
    title: "Apple Sale — MacBook Air 13.3'' M1",
    image: "/promo/macbook.jpg",
    link: "/categoria/apple-usados",
    order: 2,
    activeFrom: new Date(now.getTime() - oneYear),
    activeTo: new Date(now.getTime() + oneYear),
  },
  {
    title: "Hacemos envíos a todo el país",
    image: "/promo/envios.jpg",
    order: 3,
    activeFrom: new Date(now.getTime() - oneYear),
    activeTo: new Date(now.getTime() + oneYear),
  },
  {
    title: "Escribinos por WhatsApp",
    image: "/promo/whatsapp.jpg",
    order: 4,
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
