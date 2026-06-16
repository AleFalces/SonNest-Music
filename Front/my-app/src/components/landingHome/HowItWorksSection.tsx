"use client";

import { Search, ShoppingCart, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Explore Our Products",
    text: "Browse through a wide variety of high-quality items.",
  },
  {
    icon: ShoppingCart,
    title: "Add to Cart",
    text: "Select your products and add them to the cart.",
  },
  {
    icon: CheckCircle,
    title: "Buy and Receive",
    text: "Complete your purchase and wait for your products to arrive.",
  },
];

const HowItWorksSection: React.FC = () => {
  return (
    <section className="bg-ink px-6 py-20">
      <div className="section">
        <h2 className="mb-12 text-center text-3xl text-cream-100 md:text-4xl">
          How It Works
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, text }, index) => (
            <div
              key={title}
              className="card relative flex flex-col items-center p-8 text-center transition-transform duration-300 hover:-translate-y-1 hover:shadow-card-hover"
            >
              <span className="absolute right-4 top-4 font-display text-3xl font-bold text-cream-200">
                {index + 1}
              </span>
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gold-200 text-bordo">
                <Icon size={30} />
              </div>
              <h3 className="mb-2 text-xl">{title}</h3>
              <p className="text-ink-soft">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
