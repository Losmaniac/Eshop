import Image from "next/image";
import Link from "next/link";
import { categoryLabels } from "@/content/products";
import { lowestPrice, type CatalogProduct } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { asset } from "@/lib/site";

type Props = {
  product: CatalogProduct;
  priority?: boolean;
  headingLevel?: 2 | 3;
  /** Taller image for featured tiles. */
  large?: boolean;
};

export function ProductCard({ product, priority, headingLevel = 3, large }: Props) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const price = lowestPrice(product);
  const multiple = product.variants.length > 1 || product.orderType === "inquiry";
  const [first, second] = product.images;

  return (
    <article className="group relative flex flex-col">
      <div className={`relative overflow-hidden rounded-md bg-[#e9e6e1] ${large ? "aspect-[4/3] lg:aspect-auto lg:flex-1" : "aspect-[4/3]"}`}>
        {first && (
          <Image
            src={asset(first.src)}
            alt={first.alt}
            fill
            preload={priority}
            sizes={large ? "(min-width: 1024px) 58vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
            className={`${large ? "object-contain" : "object-cover"} transition duration-500 ease-out group-hover:scale-[1.03]`}
          />
        )}
        {second && (
          <Image
            src={asset(second.src)}
            alt=""
            fill
            sizes={large ? "(min-width: 1024px) 58vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
            className={`${large ? "object-contain" : "object-cover"} opacity-0 transition duration-500 ease-out group-hover:scale-[1.03] group-hover:opacity-100`}
          />
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="chip bg-white/85 text-ink backdrop-blur">{categoryLabels[product.category]}</span>
          {product.isBundle && product.discountPercent && (
            <span className="chip bg-rust text-white">−{product.discountPercent} %</span>
          )}
        </div>
        <span className="chip absolute bottom-3 right-3 bg-night/80 text-white backdrop-blur">3D</span>
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Heading className="text-lg font-semibold tracking-tight">
            <Link href={`/obchod/${product.slug}`} className="after:absolute after:inset-0 group-hover:text-rust-dark">
              {product.name}
            </Link>
          </Heading>
          <p className="mt-1 line-clamp-2 text-[0.9375rem] text-muted">{product.shortDescription}</p>
        </div>
        {price !== undefined && (
          <p className="shrink-0 text-right font-medium tabular-nums">
            {multiple && <span className="block text-xs font-normal text-muted">od</span>}
            {formatPrice(price)}
          </p>
        )}
      </div>
    </article>
  );
}
