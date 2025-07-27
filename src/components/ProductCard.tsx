import { Category } from "../types/products";

type ProductCardProps = {
  name: string;
  price: number;
  imageUrl: string;
  categories: Category[];
};

export function ProductCard({
  name,
  price,
  imageUrl,
  categories,
}: ProductCardProps) {
  return (
    <div className="border rounded-xl shadow-md p-4 w-64">
      <img
        src={imageUrl}
        alt={name}
        className="w-full h-40 object-cover rounded-md"
      />
      <h2 className="text-lg font-semibold mt-2">{name}</h2>
      <p className="text-gray-700 mt-1">{price.toFixed(2)} ₪</p>
      {categories.map((cat) => (
        <span key={cat} className="text-sm text-gray-500 mr-1">
          {cat}
        </span>
      ))}
    </div>
  );
}
