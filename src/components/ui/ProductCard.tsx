// src/components/ProductCard.tsx
import { useTranslation } from "react-i18next";
import { CategoryId } from "../../types/categories";
import { addItem } from "../../features/cart/cartSlice";
import { useDispatch } from "react-redux";
import { OptimizedImage } from "./OptimizedImage";
import { useDirection } from "../../hooks/useDirection";
import { useLocalizedText } from "../../utils/languageUtils";

type Props = { id: number; name: string; price: number; imageUrl: string; categoryIds: CategoryId[]; };

export function ProductCard({ id, name, price, imageUrl, categoryIds }: Props) {
  const { t } = useTranslation();
  const { dir } = useDirection();
  const dispatch = useDispatch();

  const localizedName = useLocalizedText(name);

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
      className="group product-card touch-manipulation"
      role="article"
      aria-labelledby={`product-${id}-title`}
      aria-describedby={`product-${id}-description`}
    >
      <div className="image-overlay aspect-[4/3] bg-bakery-cream-50">
        <OptimizedImage
          src={imageUrl}
          alt={`${localizedName} - ${t("common.productImage")}`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <div className="p-6">
        <h3
          id={`product-${id}-title`}
          className="font-bold text-xl text-bakery-brown-800 line-clamp-2 mb-3 group-hover:text-bakery-brown-900 transition-colors duration-300"
        >
          {localizedName}
        </h3>
        <div
          className="price-display mb-4"
          aria-label={`${t("common.price")}: ${price.toFixed(2)} ₪`}
        >
          {price.toFixed(2)} ₪
        </div>
        <div className="mb-4 flex flex-wrap gap-2" role="list" aria-label={t("common.categories")}>
          {categoryIds.map((categoryId) => (
            <span
              key={categoryId}
              className="category-chip"
              role="listitem"
              aria-label={`${t("common.categories")}: ${t(`categories.${categoryId}`)}`}
            >
              {t(`categories.${categoryId}`)}
            </span>
          ))}
        </div>
        <button
          className="w-full btn-primary text-base touch-manipulation"
          onClick={handleAddToCart}
          onKeyDown={handleKeyDown}
          aria-label={`${t("cta.add_to_cart")} - ${localizedName}`}
          aria-describedby={`product-${id}-title`}
        >
          {t("cta.add_to_cart")}
        </button>
      </div>
    </article>
  );
}
