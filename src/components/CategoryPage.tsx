// src/pages/CategoryPage.tsx
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import { ProductCard } from "../components/ProductCard";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CATEGORY_IDS } from "../types/categories";

export default function CategoryPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const products = useSelector((s: RootState) => s.productsSlice.products);

  const allowedIds = CATEGORY_IDS;

  const filtered = useMemo(
    () => products.filter((p) => p.categoryIds.some((c) => allowedIds.includes(c))),
    [products, allowedIds]
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">{t(`categories.${id}`)}</h1>
      {filtered.length === 0 ? (
        <div className="text-gray-500">{t("category.empty", "אין מוצרים בקטגוריה זו כרגע.")}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((p) => (
            <ProductCard id={p.id} key={p.id} name={p.name} price={p.price} imageUrl={p.image} categoryIds={p.categoryIds} />
          ))}
        </div>
      )}
    </div>
  );
}
