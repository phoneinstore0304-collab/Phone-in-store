import { siteConfig } from "@/config/site";

const currencyFormatter = new Intl.NumberFormat(siteConfig.locale, {
  style: "currency",
  currency: siteConfig.currency,
  maximumFractionDigits: 0,
});

export function formatPrice(price: number | string) {
  return currencyFormatter.format(Number(price));
}
