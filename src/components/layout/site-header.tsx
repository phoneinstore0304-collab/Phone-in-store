import Link from "next/link";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { Logo } from "@/components/shared/logo";
import { CartLink } from "@/components/cart/cart-link";
import { getCategories } from "@/lib/queries/products";

export async function SiteHeader() {
  const categories = await getCategories();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-6 border-b border-zinc-200 bg-white/90 px-6 py-4 backdrop-blur sm:px-10">
      <Logo />
      <nav className="hidden items-center gap-6 text-sm text-zinc-600 md:flex">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categoria/${category.slug}`}
            className="hover:text-zinc-900"
          >
            {category.name}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-4">
        <CartLink />
        <Show when="signed-out">
          <SignInButton>
            <button className="text-sm text-zinc-600 hover:text-zinc-900">
              Ingresar
            </button>
          </SignInButton>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </header>
  );
}
