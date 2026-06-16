"use client";
import { Truck, CreditCard, Headphones } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Fast Shipping",
    text: "Receive your products in record time, with no hidden fees.",
  },
  {
    icon: CreditCard,
    title: "Secure Payment",
    text: "Enjoy a protected and reliable payment experience.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    text: "Our team is always available to resolve any questions.",
  },
];

const FeaturesSection: React.FC = () => {
  return (
    <section className="bg-muted px-6 py-20">
      <div className="section">
        <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
          Why Choose Us
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="card flex flex-col items-center p-8 text-center transition-transform duration-300 hover:-translate-y-1 hover:shadow-card-hover"
            >
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

export default FeaturesSection;
