import React, { useState, useEffect } from 'react';
import '../styles/privacyAterms.css';

interface Section {
  id: string;
  title: string;
}

interface TableOfContentsProps {
  sections: Section[];
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ sections }) => {
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { 
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5],
        rootMargin: '-10% 0px -80% 0px'
      }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav className="table-of-contents">
      <ul>
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className={activeSection === section.id ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById(section.id);
                if (element) {
                  const headerOffset = 100;
                  const elementPosition = element.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                  });
                }
              }}
            >
              {section.title.split('.')[0]}.
              <span> {section.title.split('.').slice(1).join('.').trim()}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

const SITE_NAME = "zlend";

const sections = [
  { id: 'introduction', title: '1. Introduction' },
  { id: 'collection', title: '2. Information Collection' },
  { id: 'usage', title: '3. How We Use Your Information' },
  { id: 'privacy', title: '4. Zero-Knowledge Privacy' },
  { id: 'sharing', title: '5. Information Sharing' },
  { id: 'security', title: '6. Data Security' },
  { id: 'controls', title: '7. User Controls and Rights' },
  { id: 'changes', title: '8. Changes to This Policy' },
  { id: 'contact', title: '9. Contact Information' }
];

const PrivacyPage: React.FC = () => {
  return (
    <div className="content-page">
      <TableOfContents sections={sections} />
      <div className="container">
        <div className="content-header">
          <h1>Privacy Policy</h1>
        </div>
        <div className="content-body">
          <section id="introduction">
            <h2><span className="section-number">1.</span> Introduction</h2>
            <p>
              Your privacy is important to us. It is {SITE_NAME}'s policy to respect your privacy regarding any 
              information we may collect from you across our website and decentralized application.
            </p>
            <p>
              This Privacy Policy outlines how we collect, use, store, and disclose information when you use our
              services. By accessing or using {SITE_NAME}, you agree to the collection and use of information in 
              accordance with this policy.
            </p>
          </section>
          
          <section id="collection">
            <h2><span className="section-number">2.</span> Information Collection</h2>
            <p>
              As a privacy-focused decentralized platform built on the Aleo blockchain, {SITE_NAME} is designed 
              to minimize data collection. We may collect the following types of information:
            </p>
            <ul>
              <li><strong>Blockchain Data:</strong> Public blockchain data that is visible on the Aleo network</li>
              <li><strong>Usage Information:</strong> Anonymous data about how users interact with our platform</li>
              <li><strong>Connection Information:</strong> Basic technical details such as browser type, device information, and IP address</li>
              <li><strong>Cookies and Local Storage:</strong> Small files stored on your device to improve user experience</li>
              <li><strong>Voluntary Information:</strong> Information you choose to provide through support channels or community forums</li>
            </ul>
            <p>
              We prioritize privacy and collect only what is necessary to provide and improve our services.
            </p>
          </section>
          
          <section id="usage">
            <h2><span className="section-number">3.</span> How We Use Your Information</h2>
            <p>We use the information we collect for the following purposes:</p>
            <ul>
              <li>Providing and maintaining our platform</li>
              <li>Improving, personalizing, and expanding our services</li>
              <li>Understanding how users interact with our platform</li>
              <li>Developing new products, features, and functionality</li>
              <li>Communicating with you about service-related announcements</li>
              <li>Detecting, preventing, and addressing technical or security issues</li>
            </ul>
          </section>
          
          <section id="privacy">
            <h2><span className="section-number">4.</span> Zero-Knowledge Privacy</h2>
            <p>
              The {SITE_NAME} protocol leverages Aleo's zero-knowledge cryptography to enhance user privacy. 
              This technology allows for verification of transactions without revealing underlying details about 
              the participants or transaction amounts.
            </p>
            <p>
              While the protocol provides significant privacy advantages, users should understand that some 
              metadata may still be visible on the blockchain. We recommend reviewing Aleo's privacy documentation 
              to fully understand these privacy properties.
            </p>
          </section>
          
          <section id="sharing">
            <h2><span className="section-number">5.</span> Information Sharing</h2>
            <p>
              We do not sell, trade, or otherwise transfer your information to third parties for marketing or 
              advertising purposes. Information may be shared in the following circumstances:
            </p>
            <ul>
              <li>With service providers who assist us in operating our platform</li>
              <li>When required to comply with applicable laws and regulations</li>
              <li>To protect our rights, privacy, safety, or property</li>
              <li>In connection with a business transfer, merger, or acquisition</li>
            </ul>
          </section>
          
          <section id="security">
            <h2><span className="section-number">6.</span> Data Security</h2>
            <p>
              We implement reasonable security measures designed to protect your information. However, no method 
              of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee 
              absolute security.
            </p>
            <p>
              As a non-custodial platform, we do not store your private keys or have access to your wallets. 
              You are responsible for maintaining the security of your wallet and credentials.
            </p>
          </section>
          
          <section id="controls">
            <h2><span className="section-number">7.</span> User Controls and Rights</h2>
            <p>
              You can control your privacy when using {SITE_NAME} through:
            </p>
            <ul>
              <li>Managing your wallet connections</li>
              <li>Using privacy features built into the Aleo blockchain</li>
              <li>Adjusting your browser settings for cookies and local storage</li>
              <li>Choosing what personal information to share when contacting support</li>
            </ul>
            <p>
              Depending on your jurisdiction, you may have certain rights regarding your personal information, 
              including the right to access, correct, delete, or restrict processing of your data.
            </p>
          </section>
          
          <section id="changes">
            <h2><span className="section-number">8.</span> Changes to This Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
              the new Privacy Policy on this page and updating the "last updated" date.
            </p>
            <p>
              We encourage you to review this Privacy Policy periodically for any changes. Changes to this 
              Privacy Policy are effective when they are posted on this page.
            </p>
          </section>
          
          <section id="contact">
            <h2><span className="section-number">9.</span> Contact Information</h2>
            <p>
              If you have any questions or concerns about our Privacy Policy or data practices, please contact 
              us through our community channels.
            </p>
          </section>
          
          <div className="content-disclaimer">
            {SITE_NAME} provides information and resources about the fundamentals of the decentralized non-custodial 
            lending protocol called the {SITE_NAME} Protocol, comprised of open-source self-executing smart contracts 
            that are deployed on Aleo blockchain. {SITE_NAME} Labs does not control or operate any version of the {SITE_NAME} 
            Protocol on any blockchain network.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage; 