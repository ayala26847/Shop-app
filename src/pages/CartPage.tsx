import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../app/store";
import {
  setQty,
  removeItem,
  clearCart,
} from "../features/cart/cartSlice";
import { selectCartItems } from "../store/selectors/cartSelectors";
import { useTranslation } from "react-i18next";
import { useDirection } from "../hooks/useDirection";

export default function CartPage() {
  const { t, i18n } = useTranslation();
  const cartItems = useSelector(selectCartItems);
  const products = useSelector(
    (state: RootState) => state.productsSlice.products
  );
  const dispatch = useDispatch();
  const { isRTL, directionClass } = useDirection();

  const rows = Object.entries(cartItems)
    .map(([productIdStr, qty]: [string, number]) => {
      const productId = Number(productIdStr);
      const product = products.find((p) => p.id === productId);
      if (!product) return null;
      const lineTotal = product.price * qty;
      return { product, qty: qty as number, lineTotal };
    })
    .filter(Boolean) as { product: any; qty: number; lineTotal: number }[];

  const total = rows.reduce((sum, r) => sum + r.lineTotal, 0);

  // עטיפה אחידה ל־RTL/LTR
  const textAlignClass = isRTL ? "text-right" : "text-left";
  //   const flexDirClass = isRTL ? "flex-row-reverse" : "flex-row";
  const flexDirClass = "flex-row";

  if (rows.length === 0) {
    return (
      <div className={`p-6 ${textAlignClass}`} dir={directionClass}>
        <h1 className="text-2xl font-bold mb-4">{t("cart.title")}</h1>
        <p>{t("cart.empty")}</p>
      </div>
    );
  }

  return (
    <div className={`p-6 ${textAlignClass}`} dir={directionClass}>
      <h1 className="text-2xl font-bold mb-4">{t("cart.title")}</h1>

      <div className="space-y-4">
        {rows.map(({ product, qty, lineTotal }) => (
          <div
            key={product.id}
            className={`flex items-center justify-between border rounded-md p-3 ${flexDirClass}`}
          >
            <div className={`flex items-center gap-3 ${flexDirClass}`}>
              <img
                src={product.image}
                alt={product.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div>
                <div className="font-semibold">{product.name}</div>
                <div className="text-sm text-gray-500">
                  {product.price.toFixed(2)} ₪
                </div>
              </div>
            </div>

            <div className={`flex items-center gap-3 ${flexDirClass}`}>
              <input
                type="number"
                min={0}
                value={qty}
                onChange={(e) =>
                  dispatch(
                    setQty({
                      productId: product.id,
                      qty: Number(e.target.value),
                    })
                  )
                }
                className="w-16 border rounded px-2 py-1 text-center"
              />
              <div className="w-24 text-center">{lineTotal.toFixed(2)} ₪</div>
              <button
                className="border rounded px-2 py-1 hover:bg-pink-50"
                onClick={() => dispatch(removeItem({ productId: product.id }))}
              >
                {t("cart.remove")}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={`mt-6 flex items-center justify-between ${flexDirClass}`}>
        <button
          className="border rounded px-3 py-2 hover:bg-pink-50"
          onClick={() => dispatch(clearCart())}
        >
          {t("cart.clear")}
        </button>
        <div className="text-xl font-semibold">
          {t("cart.total")}: {total.toFixed(2)} ₪
        </div>
        <button className="rounded px-4 py-2 bg-pink-600 text-white hover:bg-pink-700">
          {t("cart.checkout")}
        </button>
      </div>
    </div>
  );
}
