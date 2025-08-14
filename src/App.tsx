import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import { Header } from "./components/Header";
import { Navbar } from "./components/NavBar";
import CategoryPage from "./pages/CategoryPage";
import CartPage from "./pages/CartPage";

function App() {
  return (
    <>
      {/* <Navbar /> */}
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/category/:id" element={<CategoryPage />} />
      </Routes>
    </>
  );
}

export default App;
