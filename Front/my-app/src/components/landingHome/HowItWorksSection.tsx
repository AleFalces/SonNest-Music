"use client";

import { Search, ShoppingCart, CheckCircle } from "lucide-react";

const HowItWorksSection: React.FC = () => {
  return (
    <section className="py-16 px-4 bg-gray-900">
      <h2 className="text-3xl font-bold text-white text-center mb-12">
        How It Works
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center transition-transform duration-300 hover:scale-105">
          <div className="text-red-800 mb-4">
            <Search size={48} />
          </div>
          <h3 className="text-xl font-semibold text-red-800 mb-2">
            Explore Our Products
          </h3>
          <p className="text-gray-800 text-center">
            Browse through a wide variety of high-quality items.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center transition-transform duration-300 hover:scale-105">
          <div className="text-red-800 mb-4">
            <ShoppingCart size={48} />
          </div>
          <h3 className="text-xl font-semibold text-red-800 mb-2">
            Add to Cart
          </h3>
          <p className="text-gray-800 text-center">
            Select your products and add them to the cart.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center transition-transform duration-300 hover:scale-105">
          <div className="text-red-800 mb-4">
            <CheckCircle size={48} />
          </div>
          <h3 className="text-xl font-semibold text-red-800 mb-2">
            Buy and Receive
          </h3>
          <p className="text-gray-800 text-center">
            Complete your purchase and wait for your products to arrive.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
