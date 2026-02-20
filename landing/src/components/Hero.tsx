import React, { useEffect, useMemo, useState } from 'react';
import { animate } from 'framer-motion';
import Typewriter from 'typewriter-effect';
import TextFlip from './TextFlip';

const REGISTRY_PROGRAM_ID = "token_registry.aleo";
const SNARKVM_NETWORK_NAME = "TestnetV0";
const rpcUrls = "https://testnetbeta.aleorpc.com";

export const hashStruct = async (structString: string): Promise<string> => {
  try {
    const { Plaintext } = await import('@demox-labs/aleo-sdk');
    return Plaintext.fromString(SNARKVM_NETWORK_NAME, structString).hashBhp256();
  } catch (error) {
    throw error;
  }
};

async function getMappingValue(programId: string, mappingName: string, key: string) {
  const response = await fetch(rpcUrls, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getMappingValue',
          params: {
              program_id: programId,
              mapping_name: mappingName,
              key: key,
          },
      }),
  });

  const data = await response.json();
  return data.result;
}

const getPublicBalance = async (token_id: string, publicKey: string) => {
  try {
    const tokenOwner = `{account: ${publicKey}, token_id: ${token_id}}`;
    console.log('Token Owner:', tokenOwner);
    
    const hashedStruct = await hashStruct(tokenOwner);
    console.log('Hashed Struct:', hashedStruct);
    
    const tokenBalanceStr = await getMappingValue(
      REGISTRY_PROGRAM_ID, "authorized_balances", hashedStruct,
    );
    console.log('Token Balance String:', tokenBalanceStr);
    
    if (tokenBalanceStr == null) {
      console.log('Token balance is null');
      return null;
    }

    const balanceStr = tokenBalanceStr.toString();
    const balanceMatch = balanceStr.match(/balance: (\d+)u128/);
    if (!balanceMatch) {
      console.log('No balance found in response');
      return null;
    }

    const balance = BigInt(balanceMatch[1]);
    console.log('Final Balance:', balance.toString());
    
    return {
      balance,
      token_id: tokenBalanceStr.token_id,
      account: tokenBalanceStr.account,
      authorized_until: tokenBalanceStr.authorized_until
    };
  } catch (error) {
    console.error('Error in getPublicBalance:', error);
    return null;
  }
};

import '../styles/hero.css';

import coin1 from '../assets/images/coin1.png';
import coin2 from '../assets/images/coin2.png';
import coin3 from '../assets/images/coin3.png';
import coin4 from '../assets/images/coin4.png';
import coin5 from '../assets/images/coin5.png';
import coin6 from '../assets/images/coin6.png';
import coin7 from '../assets/images/coin7.png';
import coin8 from '../assets/images/coin8.png';

const TAGLINE_PHRASES = [
  "strategy private",
  "assets safe",
  "freedom intact"
];

const Hero: React.FC = () => {
  const [tvl1, setTvl1] = useState<any>(null);
  const [tvl2, setTvl2] = useState<any>(null);
  const [tvl3, setTvl3] = useState<any>(null);
  const [tvl4, setTvl4] = useState<any>(null);
  const [displayTvl, setDisplayTvl] = useState<number | null>(null);

  useEffect(() => {
    getPublicBalance("5983142094692128773510225623816045070304444621008302359049788306211838130558field", "aleo1xmhesvkeu0nx8c59dw0cdl82x0etxl4k0q9vw2twqpvrhum03vgquyt04g")
      .then(setTvl1);

    getPublicBalance("8260953594890310383870507716927422646335575786500909254294703665587287172223field", "aleo1xmhesvkeu0nx8c59dw0cdl82x0etxl4k0q9vw2twqpvrhum03vgquyt04g")
      .then(setTvl2);

    getPublicBalance("7282192565387792361809088173158053178461960397100960262024562261205950610485field", "aleo1xmhesvkeu0nx8c59dw0cdl82x0etxl4k0q9vw2twqpvrhum03vgquyt04g")
      .then(setTvl3);

    getPublicBalance("3443843282313283355522573239085696902919850365217539366784739393210722344986field", "aleo1xmhesvkeu0nx8c59dw0cdl82x0etxl4k0q9vw2twqpvrhum03vgquyt04g")
      .then(setTvl4);
  }, []);

  const totalTvl = useMemo(() => {
    if (tvl1 === null || tvl3 === null) return null;
    return (
      Number(BigInt(tvl1?.balance || 0)) / 1_000_000 +
      Number(BigInt(tvl2?.balance || 0)) / 1_000_000 +
      Number(BigInt(tvl3?.balance || 0)) / 1_000_000_000_000_000_000 * 2500 +
      Number(BigInt(tvl4?.balance || 0)) / 1_000_000 * 0.1824
    );
  }, [tvl1, tvl2, tvl3, tvl4]);

  useEffect(() => {
    if (totalTvl === null) return;
    const controls = animate(0, totalTvl, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (value) => setDisplayTvl(value),
    });
    return () => controls.stop();
  }, [totalTvl]);
  
  return (
    <section className="hero" id="Home">
      <div className="coin-container left-1">
        <div className="coin-side">
          <div></div>
        </div>
        <div className="coin-face">
          <div className="coin-face-front-outer"><img src={coin1} /></div>
          <div className="coin-face-front-inner"></div>
          <div className="coin-face-back-outer"><img src={coin1} /></div>
          <div className="coin-face-back-inner"></div>
        </div>
      </div>

      <div className="coin-container left-2">
        <div className="coin-side">
          <div></div>
        </div>
        <div className="coin-face">
          <div className="coin-face-front-outer"><img src={coin2} /></div>
          <div className="coin-face-front-inner"></div>
          <div className="coin-face-back-outer"><img src={coin2} /></div>
          <div className="coin-face-back-inner"></div>
        </div>
      </div>

      <div className="coin-container left-3">
        <div className="coin-side">
          <div></div>
        </div>
        <div className="coin-face">
          <div className="coin-face-front-outer"><img src={coin3} /></div>
          <div className="coin-face-front-inner"></div>
          <div className="coin-face-back-outer"><img src={coin3} /></div>
          <div className="coin-face-back-inner"></div>
        </div>
      </div>

      <div className="coin-container left-4">
        <div className="coin-side">
          <div></div>
        </div>
        <div className="coin-face">
          <div className="coin-face-front-outer"><img src={coin4} /></div>
          <div className="coin-face-front-inner"></div>
          <div className="coin-face-back-outer"><img src={coin4} /></div>
          <div className="coin-face-back-inner"></div>
        </div>
      </div>

      <div className="coin-container right-1">
        <div className="coin-side">
          <div></div>
        </div>
        <div className="coin-face">
          <div className="coin-face-front-outer"><img src={coin5} /></div>
          <div className="coin-face-front-inner"></div>
          <div className="coin-face-back-outer"><img src={coin5} /></div>
          <div className="coin-face-back-inner"></div>
        </div>
      </div>

      <div className="coin-container right-2">
        <div className="coin-side">
          <div></div>
        </div>
        <div className="coin-face">
          <div className="coin-face-front-outer"><img src={coin6} /></div>
          <div className="coin-face-front-inner"></div>
          <div className="coin-face-back-outer"><img src={coin6} /></div>
          <div className="coin-face-back-inner"></div>
        </div>
      </div>

      <div className="coin-container right-3">
        <div className="coin-side">
          <div></div>
        </div>
        <div className="coin-face">
          <div className="coin-face-front-outer"><img src={coin7} /></div>
          <div className="coin-face-front-inner"></div>
          <div className="coin-face-back-outer"><img src={coin7} /></div>
          <div className="coin-face-back-inner"></div>
        </div>
      </div>

      <div className="coin-container right-4">
        <div className="coin-side">
          <div></div>
        </div>
        <div className="coin-face">
          <div className="coin-face-front-outer"><img src={coin8} /></div>
          <div className="coin-face-front-inner"></div>
          <div className="coin-face-back-outer"><img src={coin8} /></div>
          <div className="coin-face-back-inner"></div>
        </div>
      </div>

      <div className="hero-text-container">
        <div className="hero-title">
          <span className="hero-title-primary">Lend & Borrow</span>
          <span className="hero-title-secondary">
            in full <span className="hero-emphasis">privacy</span>
          </span>
        </div>
        <div className="typewriter">
          <span className="terminal-text">Keep your</span>
          <span  className="typewriter-container">
            <Typewriter
              options={{
                strings: TAGLINE_PHRASES,
                autoStart: true,
                loop: true,
                delay: 40,
                deleteSpeed: 20,
                wrapperClassName: 'Typewriter__wrapper',
                cursorClassName: 'Typewriter__cursor',
              }}
            />
          </span>
        </div>
        <div className="cta-container" style={{ marginTop: 'min(3rem, 6vh)' }}>
          <a href='https://app.zlend.fi/' target="_blank" rel="noopener noreferrer" className="cta-link">
            <TextFlip
              as="span"
              className="cta-flip-text"
              duration={0.3}
              staggerDelay={0.012}
            >
              Start Lending & Borrowing
            </TextFlip>
            <svg className="cta-arrow" version="1.0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512.000000 512.000000" preserveAspectRatio="xMidYMid meet"><g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" stroke="none"><path d="M2560 4095 l0 -255 255 0 255 0 0 -255 0 -255 255 0 255 0 0 -255 0 -255 -1532 -2 -1533 -3 0 -255 0 -255 1533 -3 1532 -2 0 -255 0 -255 -255 0 -255 0 0 -255 0 -255 -255 0 -255 0 0 -255 0 -255 255 0 255 0 0 255 0 255 255 0 255 0 0 255 0 255 258 2 257 3 3 252 2 253 253 2 252 3 0 255 0 255 -252 3 -253 2 -2 253 -3 252 -257 3 -258 2 0 255 0 255 -255 0 -255 0 0 255 0 255 -255 0 -255 0 0 -255z"/></g></svg>
          </a>
        </div>

        <div className="hero-subtitle">
          <p className='hero-subtitle-title'>TVL</p>
          <p className='hero-subtitle-value'>
            {displayTvl === null
              ? "..."
              : `$${Math.round(displayTvl).toLocaleString('en-US', { notation: 'compact', maximumFractionDigits: 0 })}`
            }
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;