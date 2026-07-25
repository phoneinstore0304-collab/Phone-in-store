import type { Metadata } from "next";
import { Inter, Space_Grotesk, Poppins } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { siteConfig } from "@/config/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Fuente aparte para el header (logo + nav): más moderna/geométrica que
// Inter, para que no se sienta "estilo Apple/iPhone".
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

// Para títulos grandes (hero, encabezados de sección) — ver --font-display
// en globals.css.
const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["500", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="es-AR"
        className={`${inter.variable} ${spaceGrotesk.variable} ${poppins.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col font-sans">{children}</body>
      </html>
    </ClerkProvider>
  );
}
