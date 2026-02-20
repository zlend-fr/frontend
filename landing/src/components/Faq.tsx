import React, { useState } from 'react';

import { FAQ_ITEMS, LANDING_FAQ_IDS } from '../constants';
import TextFlip from './TextFlip';

import '../styles/faq.css';

const Faq: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setExpandedId(currentExpandedId => (currentExpandedId === id ? null : id));
  };

  const displayedItems = FAQ_ITEMS.filter(item => LANDING_FAQ_IDS.includes(item.id)).sort((a, b) => LANDING_FAQ_IDS.indexOf(a.id) - LANDING_FAQ_IDS.indexOf(b.id));

  return (
    <section className="faq" id="FAQ">
      <div className="faq-container">
        <div className="faq-header">
          <h2 className="faq-title">Frequently Asked Questions</h2>
        </div>
        <div className="faq-content">
          <div className="faq-list">
            {displayedItems.map(item => (
              <div
                key={item.id}
                className={`faq-item ${expandedId === item.id ? 'expanded' : ''}`}
              >
                <div className="faq-item-content">
                  <div
                    className="faq-question"
                    onClick={() => toggleItem(item.id)}
                  >
                    <span className="faq-toggle"></span>
                    <h3 className="faq-question-text">{item.question}</h3>
                  </div>
                  <div className="faq-answer">
                    <p>{item.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="faq-cta">
            <a href="/faq" className="faq-cta-link">
              <TextFlip
                as="span"
                className="faq-cta-flip-text"
                duration={0.3}
                staggerDelay={0.012}
              >
                See more FAQs
              </TextFlip>
              <span className="arrow-icon"></span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Faq;