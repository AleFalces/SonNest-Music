"use client";

import { testimonials } from "@/interfaces/testimonialInterfaces";
import React from "react";

const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-16 px-4 " id="testimonios">
      <h2 className="text-3xl font-bold text-red-800 text-center mb-12">
        Testimonials
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center transition-transform duration-300 hover:scale-105 hover:shadow-lg"
          >
            <img
              src={testimonial.avatar}
              alt={testimonial.name}
              loading="lazy"
              decoding="async"
              className="w-16 h-16 rounded-full mb-4 ring-2 ring-red-800"
            />
            <p className="text-gray-800 mb-4">{testimonial.message}</p>
            <p className="font-semibold text-red-900 mb-1">
              {testimonial.name}
            </p>
            <span className="text-sm text-yellow-700">{testimonial.role}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;
