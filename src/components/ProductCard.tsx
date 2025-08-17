// src/components/ProductCard.tsx
import { useTranslation } from "react-i18next";
import { CategoryId } from "../types/categories";
import { addItem } from "../features/cart/cartSlice";
import { useDispatch } from "react-redux";
type Props = { id: number; name: string; price: number; imageUrl: string; categoryIds: CategoryId[]; };

export function ProductCard({ id, name, price, imageUrl, categoryIds }: Props) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  return (
    <div className="group border rounded-2xl bg-white overflow-hidden hover:shadow-lg transition">
      <div className="aspect-[4/3] overflow-hidden bg-gray-50">
        <img src={imageUrl} alt={name} className="h-full w-full object-cover group-hover:scale-[1.02] transition" />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg">{name}</h3>
        <div className="mt-1 text-gray-500">{price.toFixed(2)} ₪</div>
        <div className="mt-2 flex flex-wrap gap-1">
          {categoryIds.map((id) => (
            <span key={id} className="text-xs px-2 py-1 rounded-full bg-pink-50 text-pink-700 border border-pink-100">
              {t(`categories.${id}`)}
            </span>
          ))}
        </div>
        <button className="w-full mt-4 rounded-xl bg-pink-600 text-white py-2 hover:bg-pink-700 transition"
        onClick={() => dispatch(addItem({ productId: id, qty: 1 }))}>
          {t("cta.add_to_cart", "הוספה לעגלה")}
        </button>
      </div>
    </div>
  );
}
