import React from 'react';
import { SearchIcon, XIcon } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setSearchTerm } from '@/store/checkboxTreeSlice';

interface SharedSearchBoxProps {
  placeholder?: string;
  className?: string;
  onChange?: (value: string) => void;
}

const SharedSearchBox: React.FC<SharedSearchBoxProps> = ({
  placeholder = 'Search...',
  className = '',
  onChange,
}) => {
  const searchTerm = useAppSelector(state => state.checkboxTree.searchTerm);
  const dispatch = useAppDispatch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    dispatch(setSearchTerm(value));
    
    // Also notify parent component if callback is provided
    if (onChange) {
      onChange(value);
    }
  };

  const handleClear = () => {
    dispatch(setSearchTerm(''));
    
    // Also notify parent component if callback is provided
    if (onChange) {
      onChange('');
    }
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