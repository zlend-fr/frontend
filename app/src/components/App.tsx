import React from 'react';
import Header from './Header';
import Dashboard from './dashboard';
import Footer from './Footer';
import '../styles/app.css';
import '../styles/dashboard.css';

const App: React.FC = () => {
  return (
    <div className="app">
      <div className="content-wrapper">
        <Header />
        <main className="main-content">
          <Dashboard />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default App; 