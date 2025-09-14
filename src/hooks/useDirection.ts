// src/hooks/useDirection.ts
import { useTranslation } from "react-i18next";

export function useDirection() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "he";

  const dir: "rtl" | "ltr" = isRTL ? "rtl" : "ltr";
  const directionClass = dir; // אם אתה משתמש ב־classNames

  return { isRTL, dir, directionClass };
}
