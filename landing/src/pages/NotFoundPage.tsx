import React from 'react';

import '../styles/notfound.css';

const NotFoundPage: React.FC = () => {
  return (
    <div className="notFoundPageContainer">
      <h1 className="title404">
        404
      </h1>
      <h2 className="subtitle404">
        Page Not Found
      </h2>
      <p className="message404">
        Oops! The page you're looking for doesn't seem to exist.
      </p>
      <div className="error-container">
          <a href='/' rel="noopener noreferrer" className="error-link">Go to Homepage
          <svg className="error-arrow" version="1.0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512.000000 512.000000" preserveAspectRatio="xMidYMid meet"><g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" stroke="none"><path d="M2560 4095 l0 -255 255 0 255 0 0 -255 0 -255 255 0 255 0 0 -255 0 -255 -1532 -2 -1533 -3 0 -255 0 -255 1533 -3 1532 -2 0 -255 0 -255 -255 0 -255 0 0 -255 0 -255 -255 0 -255 0 0 -255 0 -255 255 0 255 0 0 255 0 255 255 0 255 0 0 255 0 255 258 2 257 3 3 252 2 253 253 2 252 3 0 255 0 255 -252 3 -253 2 -2 253 -3 252 -257 3 -258 2 0 255 0 255 -255 0 -255 0 0 255 0 255 -255 0 -255 0 0 -255z"/></g></svg>
          </a>
        </div>
    </div>
  );
};

export default NotFoundPage; 