/**
 * Optimized Framer Motion configurations for better performance
 * Use these instead of complex spring animations
 */

// Fast transition for better performance
export const fastTransition = {
  type: "tween" as const,
  duration: 0.2,
  ease: "easeOut" as const
};

// Simple fade in (much faster than spring)
export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: fastTransition
  }
};

// List item animation (optimized)
export const listItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: fastTransition
  }
};

// Stagger children (for lists)
export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // Reduced from 0.1
      delayChildren: 0,
    }
  }
};

// Scale animation (for modals/cards)
export const scaleVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: fastTransition
  }
};

// Slide in from side
export const slideInVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: fastTransition
  }
};











