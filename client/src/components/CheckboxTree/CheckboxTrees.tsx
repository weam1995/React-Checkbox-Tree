import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { TreeItem } from './types';
import SharedSearchBox from './SharedSearchBox';
import StandardAccounts from './StandardAccounts';
import DbsecAccounts from './DbsecAccounts';
import NoResultsMessage from './NoResultsMessage';

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
  // Calculate total selected items for display
  const selectedItemsOne = useAppSelector(state => state.checkboxTree.selectedItemsOne);
  const selectedItemsTwo = useAppSelector(state => state.checkboxTree.selectedItemsTwo);
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
          {/* Standard Accounts Tree */}
          <StandardAccounts 
            treeData={treeOneData}
            className="mb-4 pb-2 border-b"
          />
          
          {/* Dbsec Accounts Tree */}
          <DbsecAccounts 
            treeData={treeTwoData}
            className="mt-2 pt-2"
          />
          
          {/* No Results Message */}
          <NoResultsMessage />
        </div>
      </div>
    </div>
  );
};

export default CheckboxTrees;