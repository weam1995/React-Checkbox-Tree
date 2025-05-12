import React from 'react';
import { SearchIcon, XIcon } from 'lucide-react';
import { useTreeContext } from './TreeContext';

interface SharedSearchBoxProps {
  placeholder?: string;
  className?: string;
}

const SharedSearchBox: React.FC<SharedSearchBoxProps> = ({
  placeholder = 'Search...',
  className = '',
}) => {
  const { searchTerm, setSearchTerm } = useTreeContext();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleClear = () => {
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <SearchIcon className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleChange}
      />
      {searchTerm && (
        <button
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <XIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default SharedSearchBox;