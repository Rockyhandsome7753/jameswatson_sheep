import { useCallback, useEffect, useRef, useState } from "react";
import { BANNER_SLIDES } from "../../img/images";
import { IconChevronRight } from "../ui/Icon";
import "./Banner.css";

/** Auto-advance interval in ms. */
const INTERVAL = 4000;

export function Banner() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = BANNER_SLIDES.length;
  const liveRef = useRef<HTMLParagraphElement>(null);

  const go = useCallback(
    (next: number) => setIndex(((next % total) + total) % total),
    [total],
  );
  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  // Auto-rotation. Pauses on hover/focus and when the tab is hidden.
  useEffect(() => {
    if (paused || total <= 1) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, INTERVAL);

    return () => window.clearInterval(id);
  }, [paused, total]);

  // Pause while the browser tab is in the background.
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    }
  };

  return (
    <section
      className="banner"
      aria-roledescription="carousel"
      aria-label="Featured banners"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      <div className="banner__viewport">
        {BANNER_SLIDES.map((slide, i) => (
          <div
            className={`banner__slide ${i === index ? "is-active" : ""}`}
            key={slide.src}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${total}`}
            aria-hidden={i !== index}
          >
            <img
              className="banner__img"
              src={slide.src}
              alt={slide.alt}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              draggable={false}
            />
          </div>
        ))}

        {total > 1 && (
          <>
            <button
              className="banner__arrow banner__arrow--prev"
              type="button"
              onClick={prev}
              aria-label="Previous banner"
            >
              <IconChevronRight size={22} />
            </button>
            <button
              className="banner__arrow banner__arrow--next"
              type="button"
              onClick={next}
              aria-label="Next banner"
            >
              <IconChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="banner__dots" role="tablist" aria-label="Choose banner">
          {BANNER_SLIDES.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Banner ${i + 1}`}
              className={`banner__dot ${i === index ? "is-active" : ""}`}
              onClick={() => go(i)}
            />
          ))}
        </div>
      )}

      {/* Announces slide changes to assistive tech without visual noise. */}
      <p className="visually-hidden" aria-live="polite" ref={liveRef}>
        Banner {index + 1} of {total}
      </p>
    </section>
  );
}
