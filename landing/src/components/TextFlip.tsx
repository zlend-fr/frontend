/**
 * TextFlip component - Staggered letter slide-up animation on hover
 * Each letter slides up and out while an identical letter slides up from below
 * Uses framer-motion for smooth, GPU-accelerated animations
 */
import { motion } from 'framer-motion';
import type { ReactNode, JSX, CSSProperties } from 'react';

import '../styles/textflip.css';

/**
 * Props for the TextFlip component
 */
interface TextFlipProps {
  /** The text content to animate (must be a string) */
  children: ReactNode;
  /** Additional CSS class for the wrapper */
  className?: string;
  /** Duration of the flip animation in seconds */
  duration?: number;
  /** Stagger delay between each letter in seconds */
  staggerDelay?: number;
  /** Whether to stagger letters sequentially or animate simultaneously */
  staggered?: boolean;
  /** Custom inline styles for the wrapper */
  style?: CSSProperties;
  /** HTML element to render as */
  as?: 'span' | 'div' | 'a' | 'button';
  /** Link href (only used when as="a") */
  href?: string;
  /** Link target (only used when as="a") */
  target?: string;
  /** Link rel (only used when as="a") */
  rel?: string;
  /** Click handler */
  onClick?: () => void;
}

/**
 * TextFlip - Creates a staggered letter slide-up effect on hover
 * @example
 * ```tsx
 * <TextFlip as="a" href="/app" className="cta-flip">
 *   Start Lending & Borrowing
 * </TextFlip>
 * ```
 */
export default function TextFlip({
  children,
  className = '',
  duration = 0.5,
  staggerDelay = 0.02,
  staggered = true,
  style,
  as = 'span',
  href,
  target,
  rel,
  onClick,
}: TextFlipProps): JSX.Element {
  const text =
    typeof children === 'string'
      ? children
      : typeof children === 'number'
        ? children.toString()
        : '';
  const letters = text.split('');

  const containerVariants = {
    initial: {},
    hover: {},
  };

  const letterVariants = {
    initial: { y: 0 },
    hover: { y: '-100%' },
  };

  const content = (
    <>
      {/* Top layer - slides up and out */}
      <span className="textflip-layer" aria-hidden="true">
        {letters.map((letter, index) => (
          <motion.span
            key={`top-${String(index)}`}
            variants={letterVariants}
            transition={{
              duration,
              ease: [0.76, 0, 0.24, 1],
              delay: staggered ? index * staggerDelay : 0,
            }}
            className="textflip-letter"
          >
            {letter === ' ' ? '\u00A0' : letter}
          </motion.span>
        ))}
      </span>

      {/* Bottom layer - slides up and in */}
      <span className="textflip-layer textflip-layer--hidden" aria-hidden="true">
        {letters.map((letter, index) => (
          <motion.span
            key={`bottom-${String(index)}`}
            initial={{ y: '100%' }}
            variants={{
              initial: { y: '100%' },
              hover: { y: 0 },
            }}
            transition={{
              duration,
              ease: [0.76, 0, 0.24, 1],
              delay: staggered ? index * staggerDelay : 0,
            }}
            className="textflip-letter"
          >
            {letter === ' ' ? '\u00A0' : letter}
          </motion.span>
        ))}
      </span>

      {/* Screen reader text */}
      <span className="textflip-sr-only">{text}</span>
    </>
  );

  const wrapperClasses = `textflip ${className}`;

  if (as === 'a') {
    return (
      <motion.a
        href={href}
        target={target}
        rel={rel}
        className={wrapperClasses}
        style={style}
        variants={containerVariants}
        initial="initial"
        whileHover="hover"
        onClick={onClick}
      >
        {content}
      </motion.a>
    );
  }

  const MotionComponent = motion[as] as typeof motion.span;

  return (
    <MotionComponent
      className={wrapperClasses}
      style={style}
      variants={containerVariants}
      initial="initial"
      whileHover="hover"
      onClick={onClick}
    >
      {content}
    </MotionComponent>
  );
}
