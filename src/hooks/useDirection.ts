// src/hooks/useDirection.ts
import { useTranslation } from "react-i18next";
import { getDirection } from "../i18n";

export function useDirection() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "he";
  const dir = getDirection(i18n.language);

  return { isRTL, dir };
}
