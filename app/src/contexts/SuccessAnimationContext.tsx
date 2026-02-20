import React, { createContext, useContext, useState, useCallback } from 'react';
import SuccessAnimation from '../components/SuccessAnimation';

interface SuccessAnimationContextType {
  showSuccessAnimation: () => void;
}

const SuccessAnimationContext = createContext<SuccessAnimationContextType | undefined>(undefined);

interface SuccessAnimationProviderProps {
  children: React.ReactNode;
}

export const SuccessAnimationProvider: React.FC<SuccessAnimationProviderProps> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);

  const showSuccessAnimation = useCallback(() => {
    setIsVisible(true);
  }, []);

  const handleAnimationComplete = useCallback(() => {
    setIsVisible(false);
  }, []);

  return (
    <SuccessAnimationContext.Provider value={{ showSuccessAnimation }}>
      {children}
      {isVisible && (
        <SuccessAnimation onAnimationComplete={handleAnimationComplete} />
      )}
    </SuccessAnimationContext.Provider>
  );
};

export const useSuccessAnimation = () => {
  const context = useContext(SuccessAnimationContext);
  if (context === undefined) {
    throw new Error('useSuccessAnimation must be used within a SuccessAnimationProvider');
  }
  return context;
};