import Link from "next/link";
import { CardImage } from "@/components/public/card-image";

export type CardItem = {
  title?: string;
  value?: string;
  description?: string;
  label?: string;
  url?: string;
  image?: string;
  imageUrl?: string;
  alt?: string;
};

export function ContentCard({
  item,
  locale,
  imagePlaceholder = false,
}: {
  item: CardItem;
  locale?: "id" | "en";
  imagePlaceholder?: boolean;
}) {
  const label = item.title ?? item.label ?? "";
  const image = item.image ?? item.imageUrl;

  return (
    <article className="card">
      {(image || imagePlaceholder) && (
        <CardImage
          src={image}
          label={item.alt ?? label}
          placeholder={imagePlaceholder}
        />
      )}
      {item.value && <b className="text-4xl text-blue-600">{item.value}</b>}
      <h3 className="mt-2 text-xl font-bold">{label}</h3>
      {item.description && (
        <p className="mt-3 leading-7 text-slate-600">{item.description}</p>
      )}
      {item.url && locale && (
        <Link
          className="mt-4 inline-block font-semibold text-blue-600"
          href={item.url.startsWith("/") ? `/${locale}${item.url}` : item.url}
        >
          {locale === "id" ? "Selengkapnya" : "Learn more"}
        </Link>
      )}
    </article>
  );
}
