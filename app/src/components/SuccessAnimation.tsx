/**
 * SuccessAnimation Component
 * Displays a success animation with a checkmark in a circle
 * Features a blur overlay and smooth fade in/out transitions
 * Used to provide visual feedback for successful operations
 */

// React dependencies
import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

/**
 * Animation keyframes for drawing the circle and checkmark
 * Creates a drawing effect using stroke-dashoffset
 */
const draw = keyframes`
  to { stroke-dashoffset: 0 }
`;

/**
 * Animation keyframes for fade in effect
 * Smoothly transitions from transparent to visible
 */
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

/**
 * Animation keyframes for fade out effect
 * Smoothly transitions from visible to transparent
 */
const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

/**
 * Styled container for the success animation
 * Centers the animation and handles fade in/out transitions
 */
const SuccessAnimationContainer = styled.div<{ isExiting: boolean }>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  pointer-events: none;
  animation: ${props => props.isExiting ? fadeOut : fadeIn} 0.3s ease-out forwards;
`;

/**
 * Styled blur overlay component
 * Creates a semi-transparent backdrop with blur effect
 */
const BlurOverlay = styled.div<{ isExiting: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 999;
  animation: ${props => props.isExiting ? fadeOut : fadeIn} 0.3s ease-out forwards;
`;

/**
 * Styled SVG component for the success animation
 * Handles the drawing animations for the circle and checkmark
 */
const StyledSVG = styled.svg`
  display: block;
  height: 20vw;
  width: 20vw;
  color: #008f32;

  .circle {
    stroke-dasharray: 76;
    stroke-dashoffset: 76;
    animation: ${draw} 0.5s forwards;
  }

  .tick {
    stroke-dasharray: 18;
    stroke-dashoffset: 18;
    animation: ${draw} 0.5s forwards 0.5s;
  }
`;

/**
 * Props for the SuccessAnimation component
 * @property {() => void} [onAnimationComplete] - Callback function to be called when animation completes
 */
interface SuccessAnimationProps {
  onAnimationComplete?: () => void;
}

/**
 * SuccessAnimation Component
 * Renders a success animation with a checkmark in a circle
 * Includes a blur overlay and smooth transitions
 * 
 * @param {SuccessAnimationProps} props - Component props
 * @returns {JSX.Element} The rendered success animation component
 */
const SuccessAnimation: React.FC<SuccessAnimationProps> = ({ onAnimationComplete }) => {
  // State for managing animation exit
  const [isExiting, setIsExiting] = useState(false);

  /**
   * Handles animation timing and cleanup
   * Manages the fade out sequence and callback execution
   */
  useEffect(() => {
    // Start fade out after 2.5 seconds
    const showTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2500);

    // Complete fade out and trigger callback after 2.8 seconds
    const hideTimer = setTimeout(() => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, 2800);

    // Cleanup timers on unmount
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [onAnimationComplete]);

  return (
    <>
      {/* Blur Overlay */}
      <BlurOverlay isExiting={isExiting} />

      {/* Success Animation Container */}
      <SuccessAnimationContainer isExiting={isExiting}>
        <StyledSVG viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg">
          <g
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            fillRule="evenodd"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Circle Path */}
            <path
              className="circle"
              d="M13 1C6.372583 1 1 6.372583 1 13s5.372583 12 12 12 12-5.372583 12-12S19.627417 1 13 1z"
            />
            {/* Checkmark Path */}
            <path
              className="tick"
              d="M6.5 13.5L10 17 l8.808621-8.308621"
            />
          </g>
        </StyledSVG>
      </SuccessAnimationContainer>
    </>
  );
};

export default SuccessAnimation; 