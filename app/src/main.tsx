import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './components/App';
import WalletProviders from './components/WalletProviders';
import { SuccessAnimationProvider } from './contexts/SuccessAnimationContext';

import './styles/global.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found. Make sure there is a div with id="root" in your HTML.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <WalletProviders>
      <SuccessAnimationProvider>
        <App />
      </SuccessAnimationProvider>
    </WalletProviders>
  </React.StrictMode>
); 