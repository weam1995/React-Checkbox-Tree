import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { TreeItem } from './types';
import CheckboxTree from './CheckboxTree';
import { setSelectedItemsTwo } from '@/store/checkboxTreeSlice';

interface DbsecAccountsProps {
  treeData: TreeItem[];
  className?: string;
}

const DbsecAccounts: React.FC<DbsecAccountsProps> = ({
  treeData,
  className = ''
}) => {
  const dispatch = useAppDispatch();
  
  // Get selected items and search term from Redux store
  const selectedItems = useAppSelector(state => state.checkboxTree.selectedItemsTwo);
  const searchTerm = useAppSelector(state => state.checkboxTree.searchTerm);
  
  // Track parent nodes selected during search
  const [searchSelectedParentNodes, setSearchSelectedParentNodes] = useState<string[]>([]);
  const [previousSearch, setPreviousSearch] = useState<string>('');

  // Helper function to get all child IDs of a parent
  const getAllChildIds = (parentId: string): string[] => {
    const parent = treeData.find(item => item.id === parentId);
    if (!parent || !parent.children) return [];
    
    const childIds: string[] = [];
    const processNode = (node: TreeItem) => {
      if (!node.disabled) {
        childIds.push(node.id);
        
        if (node.children) {
          node.children.forEach(child => {
            if (!child.disabled) {
              processNode(child);
            }
          });
        }
      }
    };
    
    parent.children.forEach(child => {
      if (!child.disabled) {
        childIds.push(child.id);
        if (child.children) {
          child.children.forEach(grandchild => processNode(grandchild));
        }
      }
    });
    
    return childIds;
  };

  // Handle selection changes
  const handleSelectionChange = (newSelectedItems: string[]) => {
    let finalSelection = [...newSelectedItems];
    
    // If we're currently searching, we need special handling
    if (searchTerm) {
      const previouslySelected = new Set(selectedItems);
      
      // Find parent nodes that are newly SELECTED (added)
      const newlySelectedParentNodes = treeData
        .filter(item => 
          item.children && 
          item.children.length > 0 && 
          newSelectedItems.includes(item.id) && 
          !previouslySelected.has(item.id)
        )
        .map(item => item.id);
      
      // Find parent nodes that are newly DESELECTED (removed)
      const newlyDeselectedParentNodes = treeData
        .filter(item => 
          item.children && 
          item.children.length > 0 && 
          !newSelectedItems.includes(item.id) && 
          previouslySelected.has(item.id)
        )
        .map(item => item.id);
      
      // 1. Handle newly selected parent nodes - add all their children
      if (newlySelectedParentNodes.length > 0) {
        // Add all children of newly selected parents
        const childrenToAdd: string[] = [];
        newlySelectedParentNodes.forEach(parentId => {
          getAllChildIds(parentId).forEach(childId => {
            if (!finalSelection.includes(childId)) {
              childrenToAdd.push(childId);
            }
          });
        });
        
        finalSelection = [...finalSelection, ...childrenToAdd];
      }
      
      // 2. Handle newly deselected parent nodes - remove all their children
      if (newlyDeselectedParentNodes.length > 0) {
        // Create a set of all child IDs that should be removed
        const childrenToRemove = new Set<string>();
        newlyDeselectedParentNodes.forEach(parentId => {
          getAllChildIds(parentId).forEach(childId => {
            childrenToRemove.add(childId);
          });
        });
        
        // Filter out all children that should be removed
        finalSelection = finalSelection.filter(id => !childrenToRemove.has(id));
      }
      
      // Update our tracker with parent nodes for persistence after search is cleared
      const allParentNodes = treeData
        .filter(item => item.children && item.children.length > 0 && finalSelection.includes(item.id))
        .map(item => item.id);
        
      if (allParentNodes.length > 0) {
        setSearchSelectedParentNodes(prev => {
          const updatedList = [...prev];
          allParentNodes.forEach(parentId => {
            if (!updatedList.includes(parentId)) {
              updatedList.push(parentId);
            }
          });
          return updatedList;
        });
      }
    }
    
    dispatch(setSelectedItemsTwo(finalSelection));
    console.log("Dbsec Accounts - Selected items:", finalSelection);
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
          dispatch(setSelectedItemsTwo(updatedSelection));
        }
      }
    }
    
    // Update our tracking of the previous search term
    setPreviousSearch(searchTerm);
  }, [searchTerm, previousSearch, searchSelectedParentNodes, selectedItems, dispatch]);

  return (
    <div className={`dbsec-accounts-tree ${className}`}>
      <h3 className="text-md font-semibold text-primary mb-2">Dbsec Accounts</h3>
      <CheckboxTree
        items={treeData}
        selectedItems={selectedItems}
        onSelectionChange={handleSelectionChange}
        className="border-t-0"
        treeIndex={2}
      />
    </div>
  );
};

export default DbsecAccounts;