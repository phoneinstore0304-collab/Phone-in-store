import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <Image src="/logo.png" alt="" width={40} height={40} className="size-9" priority />
      <span className="text-lg font-bold tracking-widest text-foreground uppercase">
        {siteConfig.name}
      </span>
    </Link>
  );
}
