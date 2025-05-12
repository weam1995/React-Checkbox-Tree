import React from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { TreeItem } from './types';
import SharedSearchBox from './SharedSearchBox';
import CheckboxTree from './CheckboxTree';
import NoResultsMessage from './NoResultsMessage';
import { setSelectedItemsOne, setSelectedItemsTwo } from '@/store/checkboxTreeSlice';

interface CheckboxTreesProps {
  treeOneData: TreeItem[];
  treeTwoData: TreeItem[];
  className?: string;
}

const CheckboxTrees: React.FC<CheckboxTreesProps> = ({
  treeOneData,
  treeTwoData,
  className = ''
}) => {
  const dispatch = useAppDispatch();
  
  // Get selected items from Redux store
  const selectedItemsOne = useAppSelector(state => state.checkboxTree.selectedItemsOne);
  const selectedItemsTwo = useAppSelector(state => state.checkboxTree.selectedItemsTwo);
  
  // Handle selection changes for tree one
  const handleSelectionChangeOne = (newSelectedItems: string[]) => {
    dispatch(setSelectedItemsOne(newSelectedItems));
    console.log("Tree One - Selected items:", newSelectedItems);
  };
  
  // Handle selection changes for tree two
  const handleSelectionChangeTwo = (newSelectedItems: string[]) => {
    dispatch(setSelectedItemsTwo(newSelectedItems));
    console.log("Tree Two - Selected items:", newSelectedItems);
  };
  
  // Calculate total selected items
  const totalSelectedItems = selectedItemsOne.length + selectedItemsTwo.length;
  
  return (
    <div className={`checkbox-trees ${className}`}>
      {/* Shared Search Box */}
      <div className="mb-4">
        <SharedSearchBox 
          placeholder="Search across both trees..." 
        />
        <p className="text-sm text-gray-500 mt-2">
          This search box filters content in both tree components below
        </p>
      </div>
      
      {/* Selection Counter */}
      <div className="p-2 border-b bg-gray-50 flex justify-between items-center mb-2">
        <span className="text-sm text-gray-500">
          {totalSelectedItems} item{totalSelectedItems !== 1 ? 's' : ''} selected
        </span>
      </div>
      
      {/* Tree Container */}
      <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
        <div className="unified-tree">
          {/* First Tree */}
          <CheckboxTree
            items={treeOneData}
            selectedItems={selectedItemsOne}
            onSelectionChange={handleSelectionChangeOne}
            className="mb-0 pb-0 border-b-0"
            treeIndex={1}
          />
          
          {/* Second Tree */}
          <CheckboxTree
            items={treeTwoData}
            selectedItems={selectedItemsTwo}
            onSelectionChange={handleSelectionChangeTwo}
            className="mt-0 pt-0 border-t-0"
            treeIndex={2}
          />
          
          {/* No Results Message */}
          <NoResultsMessage />
        </div>
      </div>
    </div>
  );
};

export default CheckboxTrees;