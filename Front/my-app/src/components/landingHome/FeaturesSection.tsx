"use client";
import { Truck, CreditCard, Headphones } from "lucide-react";

const FeaturesSection: React.FC = () => {
  return (
    <section className="py-16 px-4 bg-amber-100">
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
        Why Choose Us
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center transition-transform duration-300 hover:scale-105">
          <div className="text-red-800 mb-4">
            <Truck size={48} />
          </div>
          <h3 className="text-xl font-semibold text-red-800 mb-2">
            Fast Shipping
          </h3>
          <p className="text-gray-800 text-center">
            Receive your products in record time, with no hidden fees.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center transition-transform duration-300 hover:scale-105">
          <div className="text-red-800 mb-4">
            <CreditCard size={48} />
          </div>
          <h3 className="text-xl font-semibold text-red-800 mb-2">
            Secure Payment
          </h3>
          <p className="text-gray-800  text-center">
            Enjoy a protected and reliable payment experience.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center transition-transform duration-300 hover:scale-105">
          <div className="text-red-800 mb-4">
            <Headphones size={48} />
          </div>
          <h3 className="text-xl font-semibold text-red-800 mb-2">
            24/7 Support7
          </h3>
          <p className="text-gray-800  text-center">
            Our team is always available to resolve any questions.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
