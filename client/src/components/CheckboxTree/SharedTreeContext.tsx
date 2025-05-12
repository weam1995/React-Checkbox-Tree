import React, { createContext, useState, useContext, ReactNode } from 'react';

interface SharedTreeContextType {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  isTreeOneEmpty: boolean;
  setIsTreeOneEmpty: (isEmpty: boolean) => void;
  isTreeTwoEmpty: boolean;
  setIsTreeTwoEmpty: (isEmpty: boolean) => void;
}

const SharedTreeContext = createContext<SharedTreeContextType | undefined>(undefined);

interface SharedTreeProviderProps {
  children: ReactNode;
}

export const SharedTreeProvider: React.FC<SharedTreeProviderProps> = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isTreeOneEmpty, setIsTreeOneEmpty] = useState(false);
  const [isTreeTwoEmpty, setIsTreeTwoEmpty] = useState(false);

  return (
    <SharedTreeContext.Provider 
      value={{ 
        searchTerm, 
        setSearchTerm, 
        isTreeOneEmpty, 
        setIsTreeOneEmpty,
        isTreeTwoEmpty,
        setIsTreeTwoEmpty
      }}
    >
      {children}
    </SharedTreeContext.Provider>
  );
};

export const useSharedTreeContext = (): SharedTreeContextType => {
  const context = useContext(SharedTreeContext);
  if (context === undefined) {
    throw new Error('useSharedTreeContext must be used within a SharedTreeProvider');
  }
  return context;
};