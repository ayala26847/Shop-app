import React from "react";
import { useTranslation } from "react-i18next";
import { useDirection } from "../hooks/useDirection";
import { EnhancedCart } from "../components/cart/EnhancedCart";

export default function CartPage() {
  const { t } = useTranslation();
  const { dir } = useDirection();

  return (
    <div className="container mx-auto px-4 py-8" dir={dir}>
      <h1 className="text-3xl font-bold mb-8 text-center">{t("cart.title")}</h1>
      <EnhancedCart />
    </div>
  );
}
