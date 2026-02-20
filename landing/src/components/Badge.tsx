import React, { useRef } from 'react';

import sphereImage from '/sphere.png';
import aleoBadge from '../assets/badge.svg';
import aleoLogo from '/aleologo.svg';

import '../styles/badge.css';

const Badge: React.FC = () => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pixelsRef = useRef<HTMLDivElement[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  const pixelSize = 10;

  const handleMouseEnter = () => {
    if (buttonRef.current) {
      const button = buttonRef.current;
      const rect = button.getBoundingClientRect();
      const buttonWidth = rect.width;
      const buttonHeight = rect.height;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      pixelsRef.current.forEach(pixel => pixel.remove());
      pixelsRef.current = [];

      const numPixelsX = Math.ceil(buttonWidth / pixelSize);
      const numPixelsY = Math.ceil(buttonHeight / pixelSize);
      const totalPixels = numPixelsX * numPixelsY;

      const allPixelElements: HTMLDivElement[] = [];
      for (let i = 0; i < totalPixels; i++) {
        const pixel = document.createElement('div');
        pixel.classList.add('animated-pixel');
        pixel.style.width = `${pixelSize}px`;
        pixel.style.height = `${pixelSize}px`;
        pixel.style.left = `${(i % numPixelsX) * pixelSize}px`;
        pixel.style.top = `${Math.floor(i / numPixelsX) * pixelSize}px`;
        pixel.style.opacity = '0';
        button.appendChild(pixel);
        allPixelElements.push(pixel);
      }
      pixelsRef.current = [...allPixelElements];

      for (let i = allPixelElements.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allPixelElements[i], allPixelElements[j]] = [allPixelElements[j], allPixelElements[i]];
      }

      let revealedCount = 0;
      const revealSpeed = Math.max(1, Math.floor(totalPixels / 30));

      const animateAppearance = () => {
        for (let i = 0; i < revealSpeed && revealedCount < totalPixels; i++) {
          const pixelToReveal = allPixelElements[revealedCount];
          if (pixelToReveal) {
            pixelToReveal.style.opacity = '1';
            revealedCount++;
          }
        }
        if (revealedCount < totalPixels) {
          animationFrameRef.current = requestAnimationFrame(animateAppearance);
        } else {
          animationFrameRef.current = null;
        }
      };
      animationFrameRef.current = requestAnimationFrame(animateAppearance);
    }
  };

  const handleMouseLeave = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    const pixelsToAnimate = [...pixelsRef.current];
    for (let i = pixelsToAnimate.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pixelsToAnimate[i], pixelsToAnimate[j]] = [pixelsToAnimate[j], pixelsToAnimate[i]];
    }

    let hiddenCount = 0;
    const totalPixelsToHide = pixelsToAnimate.length;
    const hideSpeed = Math.max(1, Math.floor(totalPixelsToHide / 30));

    const animateDisappearance = () => {
      for (let i = 0; i < hideSpeed && hiddenCount < totalPixelsToHide; i++) {
        const pixelToHide = pixelsToAnimate[hiddenCount];
        if (pixelToHide) {
          pixelToHide.style.opacity = '0';
          hiddenCount++;
        }
      }

      if (hiddenCount < totalPixelsToHide) {
        animationFrameRef.current = requestAnimationFrame(animateDisappearance);
      } else {
        pixelsRef.current.forEach(pixel => pixel.remove());
        pixelsRef.current = [];
        animationFrameRef.current = null;
      }
    };

    if (totalPixelsToHide > 0) {
      animationFrameRef.current = requestAnimationFrame(animateDisappearance);
    } else {
      pixelsRef.current.forEach(pixel => pixel.remove());
      pixelsRef.current = [];
    }
  };

  return (
    <section className="badge">
      <div className="badge-content">
        <div className="badge-info">
          <p className="badge-title">Powered by <img src={aleoLogo} alt="Aleo" className="aleo-logo" /></p>
          <p className="badge-description">zlend is built on Aleo, a privacy-focused blockchain that enables secure, private transactions and applications.</p>
          <button
            ref={buttonRef}
            onClick={() => window.open('https://aleo.org', '_blank')}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="badge-button"
          >
            <span className="badge-button-text">Learn more</span>
            <svg className="badge-button-arrow" version="1.0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512.000000 512.000000" preserveAspectRatio="xMidYMid meet"><g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" stroke="none"><path d="M2560 4095 l0 -255 255 0 255 0 0 -255 0 -255 255 0 255 0 0 -255 0 -255 -1532 -2 -1533 -3 0 -255 0 -255 1533 -3 1532 -2 0 -255 0 -255 -255 0 -255 0 0 -255 0 -255 -255 0 -255 0 0 -255 0 -255 255 0 255 0 0 255 0 255 255 0 255 0 0 255 0 255 258 2 257 3 3 252 2 253 253 2 252 3 0 255 0 255 -252 3 -253 2 -2 253 -3 252 -257 3 -258 2 0 255 0 255 -255 0 -255 0 0 255 0 255 -255 0 -255 0 0 -255z" /></g></svg>
          </button>
        </div>
        <div className="aleo-badge">
          <img
            src={sphereImage}
            alt="Len"
            className="badge-image"
          />
          <img
            src={aleoBadge}
            alt="Built With Aleo"
            className="aleo-badge-image"
          />
        </div>
      </div>
    </section>
  );
};

export default Badge;