import React from 'react';
import { useSharedTreeContext } from './SharedTreeContext';

/**
 * A component that displays a "No items found" message when both trees are empty
 * and a search term is present
 */
const NoResultsMessage: React.FC = () => {
  const { 
    searchTerm, 
    isTreeOneEmpty, 
    isTreeTwoEmpty 
  } = useSharedTreeContext();

  // Only show the message if both trees are empty and there is a search term
  if (!searchTerm || !isTreeOneEmpty || !isTreeTwoEmpty) {
    return null;
  }

  return (
    <div className="py-8 text-center text-gray-500">
      <p>No items found matching "{searchTerm}"</p>
    </div>
  );
};

export default NoResultsMessage;