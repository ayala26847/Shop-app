// pages/CategoryPage.tsx
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { ProductCard } from '../components/ProductCard';
import { useTranslation } from 'react-i18next';

export default function CategoryPage() {
  const { id } = useParams(); // id === 'bakery' וכו'
  const { t } = useTranslation();
  const products = useSelector((state: RootState) => state.productsSlice.products);

  // אם רוצים להתייחס גם לתת-קטגוריות: לקבל id יחיד או id של תת־קטגוריה — זה כבר אותו סינון
  const filtered = useMemo(() => {
    if (!id) return products;
    const catId = id.toString(); // בצד בטיחות
    return products.filter((p) => p.categoryIds?.includes(catId as any));
  }, [products, id]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{t(`categories.${id}`)}</h1>
      {filtered.length === 0 ? (
        <p>{t('products.noneInCategory')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filtered.map((product) => (
            <ProductCard
              id={product.id}
              key={product.id}
              name={product.name}
              price={product.price}
              imageUrl={product.image}
              categoryIds={product.categoryIds}
            />
          ))}
        </div>
      )}
    </div>
  );
}
