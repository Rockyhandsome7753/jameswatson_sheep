/**
 * Central asset registry.
 */
import banner1 from "./banner1 (1).jpg";
import banner2 from "./banner1 (2).jpg";
import banner3 from "./b3.png";
import banner4 from "./b4.png";
import logo from "./l3.png";

export const LOGO = logo;

export interface BannerSlide {
  src: string;
  alt: string;
}

export const BANNER_SLIDES: BannerSlide[] = [
  { src: banner1, alt: "Ronnet Gateway banner 1" },
  { src: banner2, alt: "Ronnet Gateway banner 2" },
  { src: banner3, alt: "Ronnet Gateway banner 3" },
  { src: banner4, alt: "Ronnet Gateway banner 4" },
];
