import React from 'react';
import { FaTwitter, FaGithub, FaDiscord } from 'react-icons/fa';

import '../styles/footer.css';
import logoText from '../assets/images/logo_text.svg';

const Footer: React.FC = () => {
  return (
    <div className="footer-container">
      <div className="footer-decorations">
        <div className="footer-decorations-top"></div>
        <div className="footer-decorations-bottom"></div>
      </div>
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-left">
            <img src={logoText} className="footer-logo" />
            <div className="footer-description">
              <p>zlend is a decentralized peer-to-peer lending and borrowing protocol built on Aleo. Unlike traditional protocols, it leverages zero-knowledge technology to enable private transactions, with a liquidation mechanism based on collateral value. Users can lend and borrow ETH, USDC, and Aleo while preserving both privacy and security.</p>
            </div>
            <div className="footer-social">
              <a href="https://discord.gg/VJkXvVKWfp" className="social-link" target="_blank" rel="noopener noreferrer"><FaDiscord /></a>
              <a href="https://twitter.com/zLendfi" className="social-link" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
              <a href="https://github.com/zLend-fi" className="social-link" target="_blank" rel="noopener noreferrer"><FaGithub /></a>
            </div>
          </div>

          <div className="footer-right">
            <div className="footer-right-section">
              <p>Ressources</p>
              <ul>
                <li><a href="/#Home">Home</a></li>
                <li><a href="/#Perks">Perks</a></li>
                <li><a href="/#FAQ">FAQ</a></li>
              </ul>
            </div>
            <div className="footer-right-section">
              <p>Ecosystem</p>
              <ul>
                <li><a href="https://aleo.org/" target="_blank" rel="noopener noreferrer">Aleo</a></li>
                <li><a href="https://provable.com/" target="_blank" rel="noopener noreferrer">Provable</a></li>
                <li><a href="https://zsociety.io/" target="_blank" rel="noopener noreferrer">zSociety</a></li>  
              </ul>
            </div>
            <div className="footer-right-section">
              <p>Company</p>
              <ul>
                <li><a href="/privacy">Privacy</a></li>
                <li><a href="/terms">Terms</a></li>
                <li><a href="mailto:contact@zlend.fi">Contact</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;