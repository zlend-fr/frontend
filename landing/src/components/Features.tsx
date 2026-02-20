import React from 'react';

interface IFeature {
  id: string;
  title: string;
  description: string;
  videoSrc: string;
}

const FEATURES_LIST: IFeature[] = [
  {
    id: 'privacy',
    title: 'Private by Design',
    description: 'All transactions are protected by zero-knowledge proofs — your activity stays yours, always.',
    videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4'
  },
  {
    id: 'security',
    title: 'Trustless Security',
    description: 'Smart contracts enforce logic — no intermediaries, no counterparty risk.',
    videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4'
  },
  {
    id: 'ux',
    title: 'Powerful UX',
    description: 'Whether you are a DeFi expert or a newcomer, the experience is intuitive and clean.',
    videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4'
  }
];

import '../styles/features.css';

const Features: React.FC = () => {
  return (
    <section className="features-section" id="Perks">
      <div className="features-decorations">
        <div className="decoration-top-features"></div>
        <div className="decoration-bottom-features"></div>
      </div>
      <div className="features-container">
        <div className="features-container-inner">
          <div className="features-left-column">
            <p className="features-main-title">Security matters.</p>
            <p className="features-main-subtitle">We sweat the security, you sleep well.</p>
          </div>
          <div className="features-right-column">
            {FEATURES_LIST.map((feature) => (
              <div key={feature.id}>
                <div className="feature-video">
                  <div className="play-button" />
                </div>
                <h3 className="feature-item-title">{feature.title}</h3>
                <p className="feature-item-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;