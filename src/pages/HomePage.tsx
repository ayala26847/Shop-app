// src/pages/HomePage.tsx
import Hero from "../components/Hero";
import BenefitsStrip from "../components/BenefitsStrip";
import CategoryChips from "../components/CategoryChips";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import { ProductCard } from "../components/ProductCard";

export default function HomePage() {
  const products = useSelector((s: RootState) => s.productsSlice.products);
  return (
    <div className="container mx-auto px-4 py-6">
      <Hero />
      <BenefitsStrip />
      <CategoryChips />
      <section id="featured" className="mt-10">
        <h2 className="text-2xl font-bold mb-4">מוצרים נבחרים</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.slice(0, 8).map((p) => (
            <ProductCard id={p.id} key={p.id} name={p.name} price={p.price} imageUrl={p.image} categoryIds={p.categoryIds} />
          ))}
        </div>
      </section>
      
    </div>
  );
}
