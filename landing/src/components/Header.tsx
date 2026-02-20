import React, { useState, useEffect, useCallback, useRef } from 'react';

import '../styles/header.css';
import logoText from '../assets/images/logo_text.svg';
import logoIcon from '../assets/images/logo_icon.svg';

const Header: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pixelsRef = useRef<HTMLDivElement[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  const pixelSize = 10;

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    if (currentScrollY <= 0 || currentScrollY + windowHeight >= documentHeight - 10) {
      setIsVisible(true);
      return;
    }

    if (currentScrollY < lastScrollY) {
      setIsVisible(true);
    } else if (currentScrollY > lastScrollY) {
      setIsVisible(false);
    }
    
    setLastScrollY(currentScrollY);
  }, [lastScrollY]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLaunchApp = () => {
    window.open('https://app.zlend.fi/', '_blank', 'noopener,noreferrer');
  };

  const handleRedirect = () => {
    window.location.href = '/';
  };

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
    <header className={`header ${isVisible ? 'visible' : 'hidden'}`}>
      <div className="logo-container">
        <img 
          src={isMobile ? logoIcon : logoText} 
          alt="Logo" 
          className={`logo-text ${isMobile ? 'mobile-logo' : ''}`} 
          onClick={handleRedirect}
        />
      </div>

      <div className="button-container">
        <button 
          ref={buttonRef}
          aria-label="Launch App"
          onClick={handleLaunchApp}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <span>Launch App</span>
        </button>
      </div>
    </header>
  );
};

export default Header;