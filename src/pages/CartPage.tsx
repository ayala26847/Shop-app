import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
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
  const { t } = useTranslation();
  const cartItems = useSelector(selectCartItems);
  const products = useSelector(
    (state: RootState) => state.productsSlice.products
  );
  const dispatch = useDispatch();
  const { isRTL, dir } = useDirection();

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
      <div className="container mx-auto px-4 py-16" dir={dir}>
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H17M9 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM20.5 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4">{t("cart.title")}</h1>
          <p className="text-gray-600 mb-8 text-lg">{t("cart.empty")}</p>
          <Link 
            to="/" 
            className="btn-primary inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {t("navbar.home")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" dir={dir}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">{t("cart.title")}</h1>

        <div className="space-y-6">
          {rows.map(({ product, qty, lineTotal }) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <div className="text-sm text-gray-500">
                      {product.price.toFixed(2)} ₪ {t("common.price")}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        dispatch(
                          setQty({
                            productId: product.id,
                            qty: Math.max(0, qty - 1),
                          })
                        )
                      }
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
                    >
                      -
                    </button>
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
                      className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <button
                      onClick={() =>
                        dispatch(
                          setQty({
                            productId: product.id,
                            qty: qty + 1,
                          })
                        )
                      }
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-lg font-semibold min-w-[80px] text-center">
                    {lineTotal.toFixed(2)} ₪
                  </div>
                  <button
                    className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200 font-medium"
                    onClick={() => dispatch(removeItem({ productId: product.id }))}
                  >
                    {t("cart.remove")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              className="px-6 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors duration-200 font-medium"
              onClick={() => dispatch(clearCart())}
            >
              {t("cart.clear")}
            </button>
            <div className="text-2xl font-bold text-center">
              {t("cart.total")}: {total.toFixed(2)} ₪
            </div>
            <button className="btn-primary px-8 py-3 text-lg">
              {t("cart.checkout")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
