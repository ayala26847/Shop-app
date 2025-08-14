import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { ProductCard } from '../components/ProductCard';

export default function HomePage() {
  const products = useSelector((state: RootState) => state.productsSlice.products);

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {products.map((product) => (
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
  );
}