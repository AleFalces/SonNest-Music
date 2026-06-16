"use client";

import { Music, Speaker, Drum, Mail } from "lucide-react";
import React from "react";

const AboutPage: React.FC = () => {
  const sections = [
    {
      Icon: Music,
      title: "Our Passion for Music",
      content: [
        `At SoundNest Instruments, music is our driving force. Founded by musicians for musicians, we understand the importance of finding the perfect instrument and continuously improving your sound.`,
        `Our mission is to provide an easy, fast, and secure shopping experience, with a team dedicated to offering you the best service.`,
      ],
    },
    {
      Icon: Speaker,
      title: "Carefully Curated Selection",
      content: [
        `We specialize in guitars, basses, drums, and essential accessories like strings and picks. Each product is selected for its tone, durability, and performance.`,
        `Whether you're setting up your first rig or upgrading your gear, you'll find what you need to play at your best here.`,
      ],
    },
    {
      Icon: Drum,
      title: "Support for Every Musician",
      content: [
        `We offer personalized recommendations, resources for beginners, and expert tips to keep your instruments in top condition.`,
        `By shopping with us, you become part of the SoundNest community, where your passion is our passion.`,
      ],
    },
    {
      Icon: Mail,
      title: "Contact Me",
      content: [
        `Are you looking for a reliable and skilled web developer for your next project? I'm here to help.`,
        `With experience in building full-stack web applications using modern technologies like React, Next.js, TypeScript, and Node.js, I focus on creating clean, responsive, and high-performance solutions.`,
        `Whether you're a small business, a startup, or an individual with an idea, I’d love to hear from you.`,
        `📍 Based in Córdoba, Argentina – available for remote work worldwide.`,
        `✉️ Email: alefalces@gmail.com`,
        `🔗 LinkedIn: https://www.linkedin.com/in/alefalces/`,
      ],
    },
  ];

  return (
    <main className="section min-h-screen py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        <h1 className="text-center text-3xl md:text-4xl">About SoundNest</h1>
        {sections.map(({ Icon, title, content }) => (
          <section
            key={title}
            className="card p-8 transition-transform duration-300 hover:-translate-y-1 hover:shadow-card-hover"
          >
            <h2 className="mb-4 flex items-center gap-3 text-2xl">
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gold-200 text-bordo">
                <Icon className="h-5 w-5" />
              </span>
              {title}
            </h2>
            <div className="space-y-3">
              {content.map((line, idx) => (
                <p key={idx} className="leading-relaxed text-ink-soft">
                  {line}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
};

export default AboutPage;
