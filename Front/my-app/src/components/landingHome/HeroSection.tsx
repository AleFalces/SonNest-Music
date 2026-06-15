"use client";

import React, { useEffect, useState } from "react";

const HeroSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 300);
  }, []);

  return (
    <section
      className={`relative flex justify-center items-center px-4 transition-opacity duration-1000 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        backgroundImage: "url(/instruments.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
      }}
    >
      <div className="absolute inset-0  bg-opacity-60"></div>

      <div
        className="relative text-center max-w-2xl p-6 rounded-lg"
        style={{ backgroundColor: "rgba(17, 24, 39, 0.5)" }}
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">
          Welcome to our store
        </h1>
        <p className="mt-4 text-lg md:text-xl text-amber-200 drop-shadow-lg">
          Explore the most incredible instruments, only here
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
