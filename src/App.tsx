// src/App.tsx – הוסף מסלול הקטגוריה
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import CategoryPage from "./pages/CategoryPage";
import { Header } from "./components/Header";
import i18n from "./i18n";
import { use, useEffect } from "react";
import CartPage from "./pages/CartPage";
import { Footer } from "./components/Footer";
import Newsletter from "./components/Newsletter";

export default function App() {
  // console.log("i18n.dir():", i18n.dir());
  useEffect(() => {
    // אם רוצים להפעיל את ה־RTL באופן דינמי, אפשר להאזין לשינוי השפה
    document.documentElement.dir = i18n.dir();
      console.log("i18n.dir():", i18n.dir());

  }, [i18n.language]);
    const isRTL = i18n.language === "he";
  const directionClass = isRTL ? "rtl" : "ltr";
      console.log("i18n.dir():", directionClass);

  return (
    <div dir={directionClass} className="min-h-screen bg-neutral-50 text-neutral-900">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
         <Route path="/cart" element={<CartPage />} />
        <Route path="/category/:id" element={<CategoryPage />} />
      </Routes>
      <Newsletter />
      <Footer />
     </div>
  );
}
