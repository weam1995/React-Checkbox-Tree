import React from 'react';
import { useAppSelector } from '@/store/hooks';

/**
 * A component that displays a "No items found" message when both trees are empty
 * and a search term is present
 */
const NoResultsMessage: React.FC = () => {
  const searchTerm = useAppSelector(state => state.checkboxTree.searchTerm);
  const isTreeOneEmpty = useAppSelector(state => state.checkboxTree.isTreeOneEmpty);
  const isTreeTwoEmpty = useAppSelector(state => state.checkboxTree.isTreeTwoEmpty);

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