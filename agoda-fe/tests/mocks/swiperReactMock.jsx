import React from "react";

export const Swiper = ({ children, ...props }) => (
  <section aria-label={props["aria-label"] || "carousel"} data-testid="swiper">
    {children}
  </section>
);

export const SwiperSlide = ({ children }) => (
  <article data-testid="swiper-slide">{children}</article>
);
