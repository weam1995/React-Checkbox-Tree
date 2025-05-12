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

  // Handle selection changes
  const handleSelectionChange = (newSelectedItems: string[]) => {
    let finalSelection = [...newSelectedItems];
    
    // If we're currently searching, we need special handling
    if (searchTerm) {
      // Find the parent nodes that were newly selected
      const previouslySelected = new Set(selectedItems);
      
      // Find parent nodes that are in the new selection but weren't in the previous selection
      const newlySelectedParentNodes = treeData
        .filter(item => 
          item.children && 
          item.children.length > 0 && 
          newSelectedItems.includes(item.id) && 
          !previouslySelected.has(item.id)
        )
        .map(item => item.id);
      
      // For each newly selected parent, add all its children
      if (newlySelectedParentNodes.length > 0) {
        // Function to get all child IDs of a parent 
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