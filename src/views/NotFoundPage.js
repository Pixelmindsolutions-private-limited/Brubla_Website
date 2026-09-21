import React from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft, ShoppingBag, Package, Store } from "lucide-react";
import Footer from "../components/Footer";

export default function NotFoundPage() {
  return (
    <>
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          {/* 404 Number */}
          <h1 className="text-8xl sm:text-9xl font-bold text-black mb-4">
            404
          </h1>

          {/* Divider */}
          <div className="w-16 h-0.5 bg-black mx-auto mb-6"></div>

          {/* Shopping Icons */}
          <div className="flex justify-center items-center gap-4 mb-6">
            <div className="p-3 border border-black rounded-full">
              <ShoppingBag size={32} className="text-black" />
            </div>
            <div className="p-3 border border-black rounded-full">
              <Package size={32} className="text-black" />
            </div>
            <div className="p-3 border border-black rounded-full">
              <Store size={32} className="text-black" />
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl font-bold text-black mb-3">
            Oops! Page Not Found
          </h2>

          {/* Description */}
          <p className="text-gray-600 text-base mb-8">
            The page you're looking for seems to have wandered off
            to another aisle. Let's get you back to shopping!
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/home"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Home size={18} />
              Go Home
            </Link>

            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 border border-black text-black font-medium rounded-lg hover:bg-black hover:text-white transition-colors"
            >
              <ShoppingBag size={18} />
              Start Shopping
            </Link>

            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={18} />
              Go Back
            </button>
          </div>

          {/* Footer */}
          <p className="mt-8 text-xs text-gray-400">
            Error 404 • Page not found • Let's find you the perfect item instead!
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}