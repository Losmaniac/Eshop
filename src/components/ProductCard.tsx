import Link from "next/link";
import { lowestPrice, type CatalogProduct } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { ProductImage } from "./ProductImage";

export function ProductCard({
  product,
  priority,
  headingLevel = 3,
}: {
  product: CatalogProduct;
  priority?: boolean;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const price = lowestPrice(product);
  const multiple = product.variants.length > 1 || product.orderType === "inquiry";
  return (
    <article className="group relative flex flex-col">
      <ProductImage
        image={product.images[0]}
        label={product.name}
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        priority={priority}
        className="aspect-[4/3] transition-opacity duration-200 group-hover:opacity-90"
      />
      <div className="mt-4 flex flex-1 flex-col">
        <Heading className="text-xl">
          <Link href={`/obchod/${product.slug}`} className="after:absolute after:inset-0 group-hover:text-rust-dark">
            {product.name}
          </Link>
        </Heading>
        <p className="mt-1 text-[0.9375rem] text-muted">{product.shortDescription}</p>
        <p className="mt-3 font-medium tabular-nums">
          {price !== undefined && (
            <>
              {multiple && "od "}
              {formatPrice(price)}
            </>
          )}
          {product.orderType === "inquiry" && <span className="ml-2 text-sm font-normal text-muted">na poptávku</span>}
          {product.isBundle && product.discountPercent && (
            <span className="ml-2 text-sm font-normal text-rust-dark">ušetříte {product.discountPercent} %</span>
          )}
        </p>
      </div>
    </article>
  );
}
