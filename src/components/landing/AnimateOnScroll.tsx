"use client";

import { useEffect, useRef, useState, ReactNode, ElementType } from "react";

type AnimationType = "fade-up" | "fade-in" | "scale-in";

interface AnimateOnScrollProps {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  threshold?: number;
  className?: string;
  as?: ElementType;
}

/**
 * Wrapper component that triggers animations when elements scroll into view.
 * Uses Intersection Observer for performance.
 * Respects prefers-reduced-motion media query via CSS.
 */
export function AnimateOnScroll({
  children,
  animation = "fade-up",
  delay = 0,
  threshold = 0.1,
  className = "",
  as: Component = "div",
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      // Skip animation, just show content
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Add delay if specified
          if (delay > 0) {
            setTimeout(() => setIsVisible(true), delay);
          } else {
            setIsVisible(true);
          }
          // Once visible, no need to observe anymore
          observer.unobserve(element);
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -50px 0px", // Trigger slightly before fully in view
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [delay, threshold]);

  const animationClass = `animate-on-scroll ${animation} ${isVisible ? "is-visible" : ""}`;

  return (
    <Component
      ref={ref}
      className={`${animationClass} ${className}`.trim()}
    >
      {children}
    </Component>
  );
}

/**
 * Higher-order component version for wrapping existing components
 */
export function withAnimateOnScroll<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  animationProps?: Omit<AnimateOnScrollProps, "children">
) {
  return function AnimatedComponent(props: P) {
    return (
      <AnimateOnScroll {...animationProps}>
        <WrappedComponent {...props} />
      </AnimateOnScroll>
    );
  };
}
