// src/components/ProductCard.tsx
import { useTranslation } from "react-i18next";
import { CategoryId } from "../../types/categories";
import { addItem } from "../../features/cart/cartSlice";
import { useDispatch } from "react-redux";
import { OptimizedImage } from "./OptimizedImage";
import { useDirection } from "../../hooks/useDirection";

type Props = { id: number; name: string; price: number; imageUrl: string; categoryIds: CategoryId[]; };

export function ProductCard({ id, name, price, imageUrl, categoryIds }: Props) {
  const { t } = useTranslation();
  const { dir } = useDirection();
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    dispatch(addItem({ productId: id, qty: 1 }));
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleAddToCart();
    }
  };

  return (
    <article
      className="group card overflow-hidden hover:shadow-lg transition-all duration-300 touch-manipulation focus-within:ring-2 focus-within:ring-pink-500 focus-within:ring-offset-2"
      role="article"
      aria-labelledby={`product-${id}-title`}
      aria-describedby={`product-${id}-description`}
    >
      <div className="aspect-[4/3] overflow-hidden bg-gray-50">
        <OptimizedImage
          src={imageUrl}
          alt={`${name} - ${t("common.productImage")}`}
          className="group-hover:scale-[1.02] transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <div className="p-4">
        <h3
          id={`product-${id}-title`}
          className="font-semibold text-lg line-clamp-2 mb-2"
        >
          {name}
        </h3>
        <div
          className="mt-1 text-gray-500 font-medium"
          aria-label={`${t("common.price")}: ${price.toFixed(2)} ₪`}
        >
          {price.toFixed(2)} ₪
        </div>
        <div className="mt-2 flex flex-wrap gap-1" role="list" aria-label={t("common.categories")}>
          {categoryIds.map((categoryId) => (
            <span
              key={categoryId}
              className="text-xs px-2 py-1 rounded-full bg-pink-50 text-pink-700 border border-pink-100"
              role="listitem"
              aria-label={`${t("common.categories")}: ${t(`categories.${categoryId}`)}`}
            >
              {t(`categories.${categoryId}`)}
            </span>
          ))}
        </div>
        <button
          className="w-full mt-4 btn-primary py-3 text-base font-medium touch-manipulation"
          onClick={handleAddToCart}
          onKeyDown={handleKeyDown}
          aria-label={`${t("cta.add_to_cart")} - ${name}`}
          aria-describedby={`product-${id}-title`}
        >
          {t("cta.add_to_cart")}
        </button>
      </div>
    </article>
  );
}
