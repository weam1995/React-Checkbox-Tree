import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { TreeItem } from './types';
import CheckboxTree from './CheckboxTree';
import { setSelectedItemsOne } from '@/store/checkboxTreeSlice';

interface StandardAccountsProps {
  treeData: TreeItem[];
  className?: string;
}

const StandardAccounts: React.FC<StandardAccountsProps> = ({
  treeData,
  className = ''
}) => {
  const dispatch = useAppDispatch();
  
  // Get selected items and search term from Redux store
  const selectedItems = useAppSelector(state => state.checkboxTree.selectedItemsOne);
  const searchTerm = useAppSelector(state => state.checkboxTree.searchTerm);
  
  // Track parent nodes selected during search
  const [searchSelectedParentNodes, setSearchSelectedParentNodes] = useState<string[]>([]);
  const [previousSearch, setPreviousSearch] = useState<string>('');

  // Handle selection changes
  const handleSelectionChange = (newSelectedItems: string[]) => {
    // If we're currently searching, we need to track any parent nodes that get selected
    if (searchTerm) {
      // Find the parent nodes in the new selection
      const parentNodes = treeData.filter(item => 
        item.children && item.children.length > 0 && newSelectedItems.includes(item.id)
      ).map(item => item.id);
      
      // Update our tracker with any new parent nodes
      if (parentNodes.length > 0) {
        setSearchSelectedParentNodes(prev => {
          const updatedList = [...prev];
          parentNodes.forEach(parentId => {
            if (!updatedList.includes(parentId)) {
              updatedList.push(parentId);
            }
          });
          return updatedList;
        });
      }
    }
    
    dispatch(setSelectedItemsOne(newSelectedItems));
    console.log("Standard Accounts - Selected items:", newSelectedItems);
  };
  
  // Effect to handle the search term changes
  useEffect(() => {
    // If search was cleared and we had a previous search term
    if (!searchTerm && previousSearch) {
      // Check if we need to add back any parent nodes that were selected during search
      if (searchSelectedParentNodes.length > 0) {
        const updatedSelection = [...selectedItems];
        let selectionChanged = false;
        
        // Add back any parent nodes that were selected during search
        searchSelectedParentNodes.forEach(parentId => {
          // If the parent node is not already in the selection, add it
          if (!updatedSelection.includes(parentId)) {
            updatedSelection.push(parentId);
            selectionChanged = true;
          }
        });
        
        // Only update if needed
        if (selectionChanged) {
          dispatch(setSelectedItemsOne(updatedSelection));
        }
      }
    }
    
    // Update our tracking of the previous search term
    setPreviousSearch(searchTerm);
  }, [searchTerm, previousSearch, searchSelectedParentNodes, selectedItems, dispatch]);

  return (
    <div className={`standard-accounts-tree ${className}`}>
      <h3 className="text-md font-semibold text-primary mb-2">Standard Accounts</h3>
      <CheckboxTree
        items={treeData}
        selectedItems={selectedItems}
        onSelectionChange={handleSelectionChange}
        className="border-b-0"
        treeIndex={1}
      />
    </div>
  );
};

export default StandardAccounts;