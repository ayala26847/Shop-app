// pages/CategoryPage.tsx
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { ProductCard } from '../components/ui/ProductCard';
import { useTranslation } from 'react-i18next';
import { useDirection } from '../hooks/useDirection';

export default function CategoryPage() {
  const { id } = useParams(); // id === 'bakery' וכו'
  const { t } = useTranslation();
  const { dir } = useDirection();
  const products = useSelector((state: RootState) => state.productsSlice.products);

  // אם רוצים להתייחס גם לתת-קטגוריות: לקבל id יחיד או id של תת־קטגוריה — זה כבר אותו סינון
  const filtered = useMemo(() => {
    if (!id) return products;
    return products.filter((product) => product.categoryIds.includes(id as any));
  }, [products, id]);

  return (
    <div className="container mx-auto px-4 py-6" dir={dir}>
      <h1 className="text-2xl font-bold mb-4">{t(`categories.${id}`)}</h1>
      {filtered.length === 0 ? (
        <p>{t('products.noneInCategory')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <ProductCard
              id={product.id}
              key={product.id}
              name={product.name}
              price={product.price}
              imageUrl={product.imageUrl}
              categoryIds={product.categoryIds}
            />
          ))}
        </div>
      )}
    </div>
  );
}
