// src/components/Footer.tsx
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useDirection } from "../../hooks/useDirection";

export function Footer() {
  const { t } = useTranslation();
  const { isRTL, dir } = useDirection();

  return (
    <footer
      dir={dir}
      className="bg-gray-900 text-gray-200 py-10 px-6 "
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* לוגו/ברנד */}
        <div>
          <h2 className="text-2xl font-bold text-pink-600">Bakeo</h2>
          <p className="mt-4 text-sm leading-6">
            {t("footer.aboutText", {
              defaultValue:
                "אביזרי אפייה דו־לשוניים שיביאו את האפייה שלכם לרמה הבאה ✨",
            })}
          </p>
        </div>

        {/* קישורים */}
        <div>
          <h3 className="text-lg font-semibold ">
            {t("footer.links")}
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/about" className="hover:text-pink-600">
                {t("menu.about")}
              </Link>
            </li>
            <li>
              <Link to="/categories" className="hover:text-pink-600">
                {t("menu.categories")}
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-pink-600">
                {t("footer.contact")}
              </Link>
            </li>
          </ul>
        </div>

        {/* שירות לקוחות */}
        <div>
          <h3 className="text-lg font-semibold ">
            {t("footer.support")}
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#" className="hover:text-pink-600">
                {t("footer.faq")}
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-pink-600">
                {t("footer.shipping")}
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-pink-600">
                {t("footer.policy")}
              </a>
            </li>
          </ul>
        </div>

        {/* רשתות חברתיות */}
        <div>
          <h3 className="text-lg font-semibold ">
            {t("footer.followUs")}
          </h3>
          <div className={`flex ${isRTL ? "space-x-reverse" : ""} space-x-4`}>
            <a href="#" aria-label="Instagram" className="hover:text-pink-600">
              📷
            </a>
            <a href="#" aria-label="Facebook" className="hover:text-pink-600">
              🌐
            </a>
            <a href="#" aria-label="WhatsApp" className="hover:text-pink-600">
              💬
            </a>
          </div>
        </div>
      </div>

      {/* תחתון */}
      <div className="border-t border-pink-200 mt-12 pt-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Bakeo.{" "}
        {t("footer.rights")}
      </div>
    </footer>
  );
}
