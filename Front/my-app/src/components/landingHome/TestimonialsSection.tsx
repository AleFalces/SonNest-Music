"use client";

import { testimonials } from "@/interfaces/testimonialInterfaces";
import { Quote } from "lucide-react";
import React from "react";

const TestimonialsSection: React.FC = () => {
  return (
    <section className="px-6 py-20" id="testimonios">
      <div className="section">
        <h2 className="mb-12 text-center text-3xl md:text-4xl">Testimonials</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="card flex flex-col items-center p-8 text-center transition-transform duration-300 hover:-translate-y-1 hover:shadow-card-hover"
            >
              <Quote className="mb-3 text-gold" size={28} />
              <p className="mb-6 text-ink-soft">{testimonial.message}</p>
              <img
                src={testimonial.avatar}
                alt={testimonial.name}
                loading="lazy"
                decoding="async"
                className="mb-3 h-16 w-16 rounded-full object-cover ring-2 ring-gold"
              />
              <p className="font-semibold text-bordo">{testimonial.name}</p>
              <span className="text-sm text-ink-soft">{testimonial.role}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
