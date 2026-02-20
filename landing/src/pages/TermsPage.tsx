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
  { id: 'services', title: '2. Services Description' },
  { id: 'protocol', title: '3. Protocol Non-Custodial Nature' },
  { id: 'responsibilities', title: '4. User Responsibilities' },
  { id: 'risks', title: '5. Financial Risks' },
  { id: 'liability', title: '6. Limitation of Liability' },
  { id: 'modifications', title: '7. Modifications to Terms' },
  { id: 'governing-law', title: '8. Governing Law' }
];

const TermsPage: React.FC = () => {
  return (
    <div className="content-page">
      <TableOfContents sections={sections} />
      <div className="container">
        <div className="content-header">
          <h1>Terms of Service</h1>
        </div>
        <div className="content-body">
          <section id="introduction">
            <h2><span className="section-number">1.</span> Introduction</h2>
            <p>
              Welcome to {SITE_NAME}. These Terms of Service govern your access to and use of the {SITE_NAME} 
              platform, including any content, functionality, and services offered through our website and 
              decentralized application.
            </p>
            <p>
              By accessing or using the {SITE_NAME} platform, you agree to be bound by these Terms of 
              Service. If you do not agree to these terms, please do not access or use our platform.
            </p>
          </section>
          
          <section id="services">
            <h2><span className="section-number">2.</span> Services Description</h2>
            <p>
              {SITE_NAME} is a decentralized lending and borrowing platform built on the Aleo blockchain that 
              facilitates privacy-preserving financial transactions. The platform allows users to:
            </p>
            <ul>
              <li>Lend digital assets to earn interest</li>
              <li>Borrow digital assets by providing appropriate collateral</li>
              <li>Interact with smart contracts deployed on the Aleo blockchain</li>
              <li>Access information about lending and borrowing markets</li>
            </ul>
          </section>
          
          <section id="protocol">
            <h2><span className="section-number">3.</span> Protocol Non-Custodial Nature</h2>
            <p>
              The {SITE_NAME} Protocol consists of open-source or source-available software deployed on the 
              Aleo blockchain. This software facilitates the lending and borrowing of digital assets through 
              self-executing smart contracts.
            </p>
            <p>
              <strong>Important:</strong> {SITE_NAME} Labs does not control or operate any version of the protocol 
              on any blockchain network. The protocol is non-custodial, meaning we never take possession of your 
              digital assets. Users maintain full control and responsibility over their digital assets at all times.
            </p>
          </section>
          
          <section id="responsibilities">
            <h2><span className="section-number">4.</span> User Responsibilities</h2>
            <p>
              As a user of {SITE_NAME}, you acknowledge and agree that:
            </p>
            <ul>
              <li>You are solely responsible for maintaining the security of your wallet and private keys</li>
              <li>All activities performed through your wallet are your responsibility</li>
              <li>You will comply with all applicable laws and regulations</li>
              <li>You have sufficient knowledge and experience to make your own evaluation of the merits and risks of using the protocol</li>
              <li>You will not engage in any activities that could damage, disable, or impair the function of the platform</li>
            </ul>
          </section>
          
          <section id="risks">
            <h2><span className="section-number">5.</span> Financial Risks</h2>
            <p>
              Using {SITE_NAME} involves significant financial risks, including but not limited to:
            </p>
            <ul>
              <li>Price volatility of digital assets</li>
              <li>Smart contract vulnerabilities and technical risks</li>
              <li>Potential for liquidation of collateral</li>
              <li>Variable interest rates and market fluctuations</li>
              <li>Regulatory uncertainty related to digital assets</li>
              <li>Network congestion, delays, or failure</li>
            </ul>
            <p>
              You acknowledge that you use the platform at your own risk and that you have conducted your own 
              investigation and assessment of the risks of using {SITE_NAME}.
            </p>
          </section>
          
          <section id="liability">
            <h2><span className="section-number">6.</span> Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, {SITE_NAME} and its affiliates shall not be liable for 
              any indirect, incidental, special, consequential, or punitive damages, including loss of profits, 
              data, or goodwill, arising out of or in connection with your access to or use of the platform.
            </p>
            <p>
              This includes, but is not limited to, damages resulting from:
            </p>
            <ul>
              <li>Smart contract vulnerabilities or failures</li>
              <li>Loss of digital assets</li>
              <li>Unauthorized access to your wallet</li>
              <li>Market volatility or unexpected economic conditions</li>
              <li>Regulatory actions or changes in law</li>
              <li>Technical failures or disruptions in service</li>
            </ul>
          </section>
          
          <section id="modifications">
            <h2><span className="section-number">7.</span> Modifications to Terms</h2>
            <p>
              We reserve the right to modify these Terms of Service at any time at our sole discretion. Any 
              changes will be effective immediately upon posting the updated terms on our website.
            </p>
            <p>
              Your continued use of {SITE_NAME} after the posting of revised Terms of Service constitutes your 
              acceptance of the changes. We encourage you to periodically review this page to stay informed 
              about any updates.
            </p>
          </section>
          
          <section id="governing-law">
            <h2><span className="section-number">8.</span> Governing Law</h2>
            <p>
              These Terms of Service shall be governed by and construed in accordance with applicable laws, 
              without regard to its conflict of law provisions.
            </p>
            <p>
              Any disputes arising under or in connection with these Terms shall be resolved through arbitration 
              in accordance with the rules of the relevant jurisdiction.
            </p>
          </section>
          
          <div className="content-disclaimer">
            The information provided on {SITE_NAME} does not constitute investment advice, financial advice, 
            trading advice, or any other sort of advice, and you should not treat any of the platform's content 
            as such. {SITE_NAME} does not recommend that any digital asset should be bought, sold, or held by you.
            Always conduct your own due diligence before making any investment decisions.
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage; 