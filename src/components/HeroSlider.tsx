"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    headline: "Which Agency Can You Actually Trust?",
    subtext: "Every agency on Pilgrym is verified with official documents.",
    cta: "See Verified Agencies",
    ctaLink: "/agencies",
    image: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1440&h=600&fit=crop",
  },
  {
    headline: "Tired of Calling Agency After Agency?",
    subtext: "Compare prices, packages, and reviews in one place.",
    cta: "Compare Now",
    ctaLink: "/packages",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1440&h=600&fit=crop",
  },
  {
    headline: "Still Making Phone Calls to Find Packages?",
    subtext: "Browse 20+ packages from 3 verified agencies. Book in minutes.",
    cta: "Start Here",
    ctaLink: "/packages",
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1440&h=600&fit=crop",
  },
  {
    headline: "Don't Settle for the First Agency You Find.",
    subtext: "Pilgrym gives you the information to make the right choice.",
    cta: "Browse Agencies",
    ctaLink: "/agencies",
    image: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1440&h=600&fit=crop",
  },
  {
    headline: "Same Package. Same Agency. Better Price.",
    subtext: "Platform fees are free for pilgrims. What you see is what you pay.",
    cta: "See Packages",
    ctaLink: "/packages",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1440&h=600&fit=crop",
  },
  {
    headline: "Need to Leave in 2 Weeks? 2 Months?",
    subtext: "Filter packages by departure date and find what fits your timeline.",
    cta: "Search Departures",
    ctaLink: "/packages",
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1440&h=600&fit=crop",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  const slide = slides[current];

  return (
    <div className="relative h-[400px] md:h-[500px] overflow-hidden bg-[#0F172A]">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src={slide.image}
          alt={slide.headline}
          fill
          className="object-cover transition-opacity duration-700"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0891b2]/90 via-[#0891b2]/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-xl">
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
              {slide.headline}
            </h1>
            <p className="text-lg text-cyan-100 mb-8">{slide.subtext}</p>
            <Link href={slide.ctaLink}>
              <Button size="xl" className="bg-white text-[#0891b2] hover:bg-cyan-50 font-semibold">
                {slide.cta} →
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-2 rounded-full transition-all"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-2 rounded-full transition-all"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === current ? "bg-white w-6" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
