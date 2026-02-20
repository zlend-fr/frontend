const FONT_TIMEOUT_MS = 3000;

const CRITICAL_FONTS = [
  { family: 'Aleo Font', weight: 400, style: 'normal', source: 'local' },
  { family: 'Alpha', weight: 400, style: 'normal', source: 'local' },
  { family: 'Noto Sans', weight: 400, style: 'normal', source: 'google' },
  { family: 'Noto Sans', weight: 500, style: 'normal', source: 'google' },
  { family: 'Noto Sans', weight: 600, style: 'normal', source: 'google' }
];

function createFontLoadPromises() {
  return CRITICAL_FONTS.map(font => {
    const descriptors = `${font.weight} ${font.style}`;
    return document.fonts.load(`${descriptors} 1em "${font.family}"`);
  });
}

function showContent() {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.style.visibility = 'visible';
    rootElement.style.opacity = '0';
    rootElement.style.transition = 'opacity 0.3s ease';
    
    const hasIntroAnimation = document.querySelector('.reveal-overlay');
    if (hasIntroAnimation) {
    } else {
      requestAnimationFrame(() => {
        rootElement.style.opacity = '1';
      });
    }
  }
}

export async function initFontLoading() {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.style.visibility = 'hidden';
    rootElement.style.opacity = '0';
  }

  const timeout = new Promise(resolve => {
    setTimeout(() => {
      console.warn('Font loading timed out - showing content anyway');
      resolve('timeout');
    }, FONT_TIMEOUT_MS);
  });
  
  if (document.fonts && typeof document.fonts.load === 'function') {
    try {
      const result = await Promise.race([
        Promise.all(createFontLoadPromises()),
        timeout
      ]);
      
      if (result !== 'timeout') {
        console.info('All critical fonts loaded successfully');
      }
    } catch (err) {
      console.warn('Error loading fonts:', err);
    }
  } else {
    console.info('Font Loading API not supported in this browser');
  }
  
  showContent();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFontLoading);
} else {
  initFontLoading();
}