"use client";

import {
  CSSProperties,
  ReactNode,
  useSyncExternalStore,
  type ElementType,
} from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

export type RevealDirection =
  | "up"
  | "down"
  | "left"
  | "right"
  | "scale"
  | "none";

const DESKTOP_MEDIA = "(min-width: 1024px)";

function subscribeToDesktopLayout(onChange: () => void) {
  const query = window.matchMedia(DESKTOP_MEDIA);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getDesktopLayout() {
  return window.matchMedia(DESKTOP_MEDIA).matches;
}

/** Server render assumes the widest layout so desktop never flashes. */
function getServerDesktopLayout() {
  return true;
}

function useIsDesktopLayout() {
  return useSyncExternalStore(
    subscribeToDesktopLayout,
    getDesktopLayout,
    getServerDesktopLayout,
  );
}

/** The only props this component ever forwards to the rendered tag. */
type RevealElementProps = {
  "data-reveal"?: string;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
  href?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  variants: Variants;
  initial: string;
  whileInView: string;
  viewport: { once: boolean; amount: number; margin: string };
  transition: { duration: number; delay: number; ease: number[] };
  children?: ReactNode;
};

type RevealRenderer = (props: RevealElementProps) => ReactNode;

function buildVariants(
  direction: RevealDirection,
  distance: number,
  reduceMotion: boolean,
): Variants {
  if (reduceMotion) {
    return {
      hidden: { opacity: 0.3, x: 0, y: 0 },
      visible: { opacity: 1, x: 0, y: 0 },
    };
  }

  switch (direction) {
    case "down":
      return {
        hidden: { opacity: 0.12, x: 0, y: -distance, filter: "blur(6px)" },
        visible: { opacity: 1, x: 0, y: 0, filter: "blur(0px)" },
      };

    case "left":
      return {
        hidden: { opacity: 0.12, x: distance, y: 0, filter: "blur(6px)" },
        visible: { opacity: 1, x: 0, y: 0, filter: "blur(0px)" },
      };

    case "right":
      return {
        hidden: { opacity: 0.12, x: -distance, y: 0, filter: "blur(6px)" },
        visible: { opacity: 1, x: 0, y: 0, filter: "blur(0px)" },
      };

    case "scale":
      return {
        hidden: { opacity: 0.12, x: 0, y: 0, scale: 0.9, filter: "blur(6px)" },
        visible: { opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" },
      };

    case "none":
      return {
        hidden: { opacity: 0.12, x: 0, y: 0, filter: "blur(6px)" },
        visible: { opacity: 1, x: 0, y: 0, filter: "blur(0px)" },
      };

    case "up":
    default:
      return {
        hidden: { opacity: 0.12, x: 0, y: distance, filter: "blur(6px)" },
        visible: { opacity: 1, x: 0, y: 0, filter: "blur(0px)" },
      };
  }
}

interface ScrollRevealProps {
  children: ReactNode;
  /**
   * Tag to render. Pass the tag the element already used so the reveal replaces
   * that element instead of nesting a wrapper around it — a wrapper would add a
   * new box to every grid/flex parent and change the layout.
   */
  as?: ElementType;
  direction?: RevealDirection;
  /** Direction used below the `lg` breakpoint, where columns stack vertically. */
  mobileDirection?: RevealDirection;
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
  href?: string;
  /** Seconds added per `index` step to `delay`, for cascading card grids. */
  staggerChildren?: number;
  index?: number;
  amount?: number;
  viewportMargin?: string;
  /** Forwarded so a reveal can also be the interactive element it replaces. */
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
}

export default function ScrollReveal({
  children,
  as = "div",
  direction = "up",
  mobileDirection,
  delay = 0,
  duration = 0.7,
  distance = 72,
  once = true,
  className,
  style,
  "aria-label": ariaLabel,
  href,
  staggerChildren,
  index,
  amount = 0.2,
  viewportMargin = "0px 0px -48px 0px",
  type,
  onClick,
}: ScrollRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const isDesktopLayout = useIsDesktopLayout();

  const reduceMotion = Boolean(prefersReducedMotion);
  const activeDirection =
    mobileDirection && !isDesktopLayout ? mobileDirection : direction;

  const revealDistance =
    activeDirection === "left" || activeDirection === "right"
      ? Math.min(Math.max(distance, 24), 32)
      : Math.max(distance, 48);
  const variants = buildVariants(activeDirection, revealDistance, reduceMotion);

  const childDelay =
    typeof index === "number" && typeof staggerChildren === "number"
      ? delay + index * staggerChildren
      : delay;

  const Component =
    ((motion as unknown as Record<string, RevealRenderer>)[
      String(as)
    ] as RevealRenderer | undefined) ??
    ((motion as unknown as Record<string, RevealRenderer>).div as RevealRenderer);

  return (
    <Component
      data-reveal=""
      className={className}
      aria-label={ariaLabel}
      href={href}
      style={{
        ...style,
        transitionProperty:
          "box-shadow, background-color, border-color, color",
      }}
      type={type}
      onClick={onClick}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount, margin: viewportMargin }}
      transition={{
        duration: reduceMotion ? 0.35 : Math.max(duration, 1.1),
        delay: reduceMotion ? 0 : childDelay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </Component>
  );
}
