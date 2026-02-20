import React, { useRef, useState } from 'react';

import '../styles/newsletter.css';

const Newsletter: React.FC = () => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pixelsRef = useRef<HTMLDivElement[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
    
    if (emailInput.checkValidity()) {
      setShowConfirmation(true);
      emailInput.value = '';
      
      setTimeout(() => {
        setShowConfirmation(false);
      }, 3000);
    }
  };

  return (
    <section className="newsletter-container">
      <div className="newsletter">
        <div className="newsletter-content-left">
          <h2 className="newsletter-title">Stay Updated</h2>
          <p className="newsletter-subtitle">Be the first to hear zlend protocol news.</p>
        </div>
        <form className="newsletter-form" onSubmit={handleSubmit}>
          <p className="newsletter-form-title">Email</p>
          <div className="newsletter-form-input-container">
            <input
              type="email"
              className="newsletter-input"
              placeholder="contact@zlend.fi"
              required
            />
            {showConfirmation && (
              <div className="confirmation-message">
                Thanks for subscribing!
              </div>
            )}
            <button 
              ref={buttonRef}
              type="submit" 
              className="newsletter-button"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <span className="newsletter-button-text">Subscribe</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;