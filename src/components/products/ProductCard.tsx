import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import type { Product } from "@/lib/products/queries";

export function ProductCard({ product }: { product: Product }) {
  const previewColor = product.product_colors[0];

  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="transition-colors hover:border-accent">
        <div className="relative aspect-square bg-background">
          {previewColor?.front_mockup_url && (
            <Image
              src={previewColor.front_mockup_url}
              alt={`${product.name} in ${previewColor.name}`}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 33vw, 90vw"
            />
          )}
        </div>
        <div className="p-6">
          <h3 className="text-body-lg font-semibold text-foreground">
            {product.name}
          </h3>
          {product.description && (
            <p className="mt-2 text-body-sm text-muted">
              {product.description}
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
}
