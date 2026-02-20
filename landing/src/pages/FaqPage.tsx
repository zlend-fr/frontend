import React, { useState, useEffect, useRef } from 'react';
import { FAQ_ITEMS } from '../constants';

const themeToSlug = (themeName: string) => {
  return themeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
};

const FaqPage: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTheme, setActiveTheme] = useState<string>('');
  const themeRefs = useRef<Record<string, HTMLElement | null>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  const toggleItem = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const groupedFaqs = FAQ_ITEMS.reduce((acc, faq) => {
    const theme = faq.theme || 'Other';
    if (!acc[theme]) {
      acc[theme] = [];
    }
    acc[theme].push(faq);
    return acc;
  }, {} as Record<string, typeof FAQ_ITEMS>);

  const themes = Object.keys(groupedFaqs);

  useEffect(() => {
    if (themes.length > 0 && !activeTheme) {
      setActiveTheme(themeToSlug(themes[0]));
    }

    const options = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const themeId = entry.target.id;
          setActiveTheme(themeId);
        }
      });
    }, options);

    themes.forEach((theme) => {
      const element = document.getElementById(themeToSlug(theme));
      if (element && observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [themes, activeTheme]);

  const scrollToTheme = (themeSlug: string) => {
    const element = document.getElementById(themeSlug);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="content-page faq-page-layout">
      <div className="container">
        <div className="content-header">
          <h1>Frequently Asked Questions</h1>
        </div>

        <div className="faq-main-content">
          <div className="faq-list-themed">
            {themes.map((theme) => (
              <section 
                key={theme} 
                id={themeToSlug(theme)} 
                className="faq-theme-section"
                ref={(el) => { themeRefs.current[themeToSlug(theme)] = el; }}
              >
                <h2 className="faq-theme-title">{theme}</h2>
                {groupedFaqs[theme].map((faq) => (
                  <div
                    key={faq.id}
                    className={`faq-item ${expandedId === faq.id ? 'expanded' : ''}`}
                  >
                    <div className="faq-item-content">
                      <div
                        className="faq-question"
                        onClick={() => toggleItem(faq.id)}
                      >
                        <h3>{faq.question}</h3>
                        <span className="faq-toggle"></span>
                      </div>
                      <div className="faq-answer">
                        <p dangerouslySetInnerHTML={{ __html: faq.answer }}></p>
                      </div>
                    </div>
                  </div>
                ))}
              </section>
            ))}
          </div>

          <aside className="faq-sidebar">
            <nav className="faq-theme-nav">
              <ul>
                {themes.map((theme) => {
                  const slug = themeToSlug(theme);
                  return (
                    <li key={slug}>
                      <a 
                        href={`#${slug}`}
                        className={`faq-theme-nav-link ${activeTheme === slug ? 'active' : ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          scrollToTheme(slug);
                        }}
                      >
                        {theme.split('.')[0]}
                        <span>{theme.split('.').slice(1).join('.').trim()}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default FaqPage; 