import { useTranslation } from "react-i18next";
import { CategoryId } from "../types/categories";
import { useDispatch } from "react-redux";
import { addItem } from "../features/cart/cartSlice";

type ProductCardProps = {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  categoryIds: CategoryId[];
};

export function ProductCard({
  id,
  name,
  price,
  imageUrl,
  categoryIds,
}: ProductCardProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  return (
    <div className="border rounded-xl shadow-md p-4 w-64">
      <img src={imageUrl} alt={name} className="w-full h-40 object-cover rounded-md" />
      <h2 className="text-lg font-semibold mt-2">{name}</h2>
      <p className="text-gray-700 mt-1">{price.toFixed(2)} ₪</p>

      <div className="mt-1">
        {categoryIds.map((id) => (
          <span key={id} className="text-sm text-gray-500 mr-1">
            {t(`categories.${id}`)}
          </span>
        ))}
      </div>

      <button
        className="mt-3 w-full rounded-md border px-3 py-2 hover:bg-pink-50"
        onClick={() => dispatch(addItem({ productId: id, qty: 1 }))}
      >
        {t('cart.add')}
      </button>
    </div>
  );
}
