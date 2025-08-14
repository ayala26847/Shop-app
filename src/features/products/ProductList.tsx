import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { Product } from '../../types/products';

const ProductList = () => {
  const products = useSelector((state: RootState) => state.productsSlice.products);
  const selectedCategory = useSelector((state: RootState) => state.productsSlice.selectedCategoryId);
  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {products.map((product: Product) => (
        <div key={product.id} className="border p-4 rounded shadow">
          <div className="text-4xl mb-2">{product.image}</div>
          <h2 className="text-xl font-bold">{product.name}</h2>
          <p>{product.price} ₪</p>
          <button className="mt-2 bg-blue-500 text-white px-4 py-1 rounded">
            הוסף לעגלה
          </button>
        </div>
      ))}
    </div>
  );
};

export default ProductList;