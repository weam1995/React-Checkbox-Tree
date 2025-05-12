import React, { createContext, useState, useContext, ReactNode } from 'react';

interface TreeContextType {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const TreeContext = createContext<TreeContextType | undefined>(undefined);

interface TreeProviderProps {
  children: ReactNode;
}

export const TreeProvider: React.FC<TreeProviderProps> = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <TreeContext.Provider value={{ searchTerm, setSearchTerm }}>
      {children}
    </TreeContext.Provider>
  );
};

export const useTreeContext = (): TreeContextType => {
  const context = useContext(TreeContext);
  if (context === undefined) {
    throw new Error('useTreeContext must be used within a TreeProvider');
  }
  return context;
};