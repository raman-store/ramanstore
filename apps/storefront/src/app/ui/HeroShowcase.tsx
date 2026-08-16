"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { API_BASE } from "../lib/api";

type Slide = { id: string; label: string; title: string; note: string; href: string; buttonText?: string; media?: { type: "image" | "video"; url: string } };
const fallbackSlides: Slide[] = [
  { id: "brand", label: "Raman Store", title: "Style that feels like you.", note: "Fashion and finishing touches for every celebration", href: "/shop" },
  { id: "women", label: "Women’s edit", title: "Everyday elegance.", note: "Fresh silhouettes for work, weekends and celebrations", href: "/shop?category=female-wear" },
  { id: "kids", label: "Kids’ collection", title: "Little looks, big joy.", note: "Comfortable styles made for movement and memories", href: "/shop?category=kids-wear" },
  { id: "jewellery", label: "Jewellery edit", title: "The perfect finishing touch.", note: "Statement and everyday pieces for every occasion", href: "/shop?category=artificial-jewellery" },
];

export function HeroShowcase() {
  const [slides, setSlides] = useState<Slide[]>(fallbackSlides);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => { fetch(`${API_BASE}/sliders`).then((response) => response.ok ? response.json() : Promise.reject()).then((data) => { if (data.items?.length) { setSlides(data.items); setActive(0); } }).catch(() => {}); }, []);
  useEffect(() => { if (paused || slides.length < 2) return; const timer = setInterval(() => setActive((current) => (current + 1) % slides.length), 4800); return () => clearInterval(timer); }, [paused, slides.length]);
  const slide = slides[active] || slides[0];
  const go = (index: number) => setActive((index + slides.length) % slides.length);
  const initial = slide.id === "women" ? "W" : slide.id === "kids" ? "K" : slide.id === "jewellery" ? "J" : "R";
  return <div className="brandShowcase" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
    <div className="showcaseHalo" />
    <div className={`showcaseCard showcaseSlide ${slide.id}`} key={slide.id}>
      {slide.media && <div className="showcaseMedia">{slide.media.type === "video" ? <video src={slide.media.url} autoPlay muted loop playsInline /> : <img src={slide.media.url} alt="" />}<span /></div>}
      <span className="showcaseLabel">{slide.label}</span>
      {!slide.media && (slide.id === "brand" ? <img src="/raman-store-brand-v2.png" alt="Raman Store logo" /> : <div className="collectionArtwork" aria-hidden="true"><span>{initial}</span></div>)}
      <strong>{slide.title}</strong><small>{slide.note}</small>
      <Link className="slideLink" href={slide.href}>{slide.buttonText || (slide.id === "brand" ? "Explore the store" : "Shop collection")} →</Link>
    </div>
    {slides.length > 1 && <><button className="showcaseArrow previous" onClick={() => go(active - 1)} aria-label="Previous slide">‹</button><button className="showcaseArrow next" onClick={() => go(active + 1)} aria-label="Next slide">›</button><div className="showcaseDots">{slides.map((item, index) => <button key={item.id} className={index === active ? "active" : ""} onClick={() => go(index)} aria-label={`Show ${item.label} slide`} />)}</div></>}
    <div className="slideCounter"><span>{String(active + 1).padStart(2, "0")}</span> / {String(slides.length).padStart(2, "0")}</div>
  </div>;
}
