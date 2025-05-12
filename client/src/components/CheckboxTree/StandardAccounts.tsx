import React from 'react';
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
  
  // Get selected items from Redux store
  const selectedItems = useAppSelector(state => state.checkboxTree.selectedItemsOne);

  // Handle selection changes
  const handleSelectionChange = (newSelectedItems: string[]) => {
    dispatch(setSelectedItemsOne(newSelectedItems));
    console.log("Standard Accounts - Selected items:", newSelectedItems);
  };

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