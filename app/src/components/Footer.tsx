import React, { useEffect, useState } from 'react';
import { FaTwitter, FaGithub, FaDiscord } from 'react-icons/fa';
import '../styles/footer.css';

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

const Footer: React.FC = () => {
  const [tvl1, setTvl1] = useState<any>(null);
  const [tvl2, setTvl2] = useState<any>(null);
  const [tvl3, setTvl3] = useState<any>(null);
  const [tvl4, setTvl4] = useState<any>(null);

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
  
  return (
    <footer className="footer">
      <nav className="footer-nav-links">
        <a href="https://zlend.fi/terms" target="_blank" rel="noopener noreferrer" className="footer-link">Terms</a>
        <a href="https://zlend.fi/privacy" target="_blank" rel="noopener noreferrer" className="footer-link">Privacy</a>
        <a href="https://zlend.fi/#FAQ" target="_blank" rel="noopener noreferrer" className="footer-link">FAQs</a>
      </nav>

      <p className='tvl'>
        TVL: {tvl1 === null || tvl2 === null || tvl3 === null || tvl4 === null ? (
          "Null"
        ) : (
          `$${Number(BigInt(tvl1?.balance || 0)) / 1_000_000 + Number(BigInt(tvl2?.balance || 0)) / 1_000_000 + Number(BigInt(tvl3?.balance || 0)) / 1_000_000_000_000_000_000 * 2500 + Number(BigInt(tvl4?.balance || 0)) / 1_000_000 * 0.1824}`
        )}
      </p>

      <div className="footer-social-icons">
        <a 
          href="https://discord.gg/VJkXvVKWfp"
          className="social-icon"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaDiscord />
        </a>
        <a 
          href="https://twitter.com/zLendfi"
          className="social-icon"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaTwitter />
        </a>
        <a 
          href="https://github.com/zLend-fi" 
          className="social-icon"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaGithub />
        </a>
      </div>
    </footer>
  );
};

export default Footer; 