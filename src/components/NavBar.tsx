import { useState } from 'react';
import { Link } from 'react-router-dom';
import React from "react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md px-4 py-3 flex items-center justify-between">
      <div className="text-xl font-bold text-pink-600">My Shop</div>

      {/* כפתור ההמבורגר – רק במסכים קטנים */}
      <button
        className="md:hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* תפריט – מוצג תמיד במסכים בינוניים ומעלה, ובנייד רק אם isOpen */}
      <div
        className={`${
          isOpen ? 'block' : 'hidden'
        } absolute top-full left-0 w-full bg-white shadow-md px-4 py-2 md:static md:flex md:space-x-4 md:items-center md:w-auto md:shadow-none`}
      >
        <Link to="/" className="block py-1 hover:text-pink-600">Home</Link>
        <Link to="/about" className="block py-1 hover:text-pink-600">About</Link>
        <Link to="/contact" className="block py-1 hover:text-pink-600">Contact</Link>
      </div>
    </nav>
  );
}
