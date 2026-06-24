"use client";

import { useEffect, useState } from "react";
import { NAV_ITEMS, SECTIONS } from "@/lib/content";
import { cn } from "@/lib/cn";
import { BrandMark } from "./BrandMark";
import { IconArrowRight } from "./icons";

/** Sticky top bar with brand, scroll-spy nav and a persistent start-test action. */
export function SiteHeader() {
  const [active, setActive] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const ids = NAV_ITEMS.map((n) => n.href.slice(1));
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));

    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-300",
        scrolled
          ? "border-line bg-canvas/80 backdrop-blur-xl"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="shell flex h-16 items-center justify-between gap-4">
        <a href="#top" className="flex items-center gap-2.5" aria-label="Test ADHD, acasă">
          <BrandMark className="h-7 w-7" />
          <span className="font-display text-base font-bold tracking-tight text-ink">
            Test<span className="text-primary">ADHD</span>
            <span className="text-ink-faint">.ro</span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigare secțiuni">
          {NAV_ITEMS.slice(0, 3).map((item) => {
            const isActive = active === item.href.slice(1);
            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-full px-3.5 text-sm font-medium transition-colors",
                  isActive ? "text-primary" : "text-ink-soft hover:text-ink",
                )}
                aria-current={isActive ? "true" : undefined}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <a
          href={`#${SECTIONS.test}`}
          className="group inline-flex min-h-11 items-center gap-1.5 rounded-full bg-ink px-4 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 active:translate-y-0"
        >
          Începe testul
          <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>
    </header>
  );
}
