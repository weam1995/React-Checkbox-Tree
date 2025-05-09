import React, { useState, useEffect, useMemo } from 'react';
import { CheckboxTreeProps } from './types';
import SearchBox from './SearchBox';
import TreeNode from './TreeNode';
import { itemMatchesSearch } from '@/lib/treeUtils';

const CheckboxTree: React.FC<CheckboxTreeProps> = ({
  items,
  selectedItems,
  onSelectionChange,
  onSearch,
  searchPlaceholder = 'Search elements...',
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  const [filteredItems, setFilteredItems] = useState(items);

  // Filter items based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredItems(items);
      return;
    }

    const filtered = items.filter(item => itemMatchesSearch(item, searchTerm));
    setFilteredItems(filtered);

    // Auto-expand nodes that match search criteria
    if (searchTerm) {
      const nodesToExpand = new Set<string>();
      
      const findAndMarkExpandableNodes = (items: typeof filteredItems, parentPath = '') => {
        items.forEach(item => {
          const fullPath = parentPath ? `${parentPath}.${item.id}` : item.id;
          if (itemMatchesSearch(item, searchTerm)) {
            // Add all parent paths to be expanded
            const parts = fullPath.split('.');
            for (let i = 1; i < parts.length; i++) {
              nodesToExpand.add(parts.slice(0, i).join('.'));
            }
            // Add this node to be expanded if it has children
            if (item.children?.length) {
              nodesToExpand.add(fullPath);
            }
          }
          
          if (item.children?.length) {
            findAndMarkExpandableNodes(item.children, fullPath);
          }
        });
      };
      
      findAndMarkExpandableNodes(filtered);
      setExpandedNodes(Array.from(nodesToExpand));
    }
  }, [searchTerm, items]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleExpandToggle = (nodeId: string) => {
    setExpandedNodes(prev => 
      prev.includes(nodeId)
        ? prev.filter(id => id !== nodeId)
        : [...prev, nodeId]
    );
  };

  // Helper to expand all nodes
  const expandAll = () => {
    const allExpandableNodes: string[] = [];
    
    const collectNodes = (nodes: typeof items, parentId = '') => {
      nodes.forEach(node => {
        const currentId = parentId ? `${parentId}.${node.id}` : node.id;
        if (node.children && node.children.length > 0) {
          allExpandableNodes.push(currentId);
          collectNodes(node.children, currentId);
        }
      });
    };
    
    collectNodes(items);
    setExpandedNodes(allExpandableNodes);
  };

  // Helper to collapse all nodes
  const collapseAll = () => {
    setExpandedNodes([]);
  };

  return (
    <div className={`checkbox-tree ${className}`}>
      <div className="p-4 border-b">
        <SearchBox
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder={searchPlaceholder}
        />
      </div>
      
      <div className="p-2 border-b bg-gray-50 flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
        </span>
        <div className="flex space-x-2">
          <button
            onClick={expandAll}
            className="text-xs text-primary hover:text-primary/80 font-medium"
            aria-label="Expand all nodes"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="text-xs text-primary hover:text-primary/80 font-medium"
            aria-label="Collapse all nodes"
          >
            Collapse All
          </button>
        </div>
      </div>
      
      <div className="overflow-y-auto p-2 max-h-[calc(100vh-200px)]">
        {filteredItems.length > 0 ? (
          <ul className="checkbox-tree-list">
            {filteredItems.map(item => (
              <TreeNode
                key={item.id}
                item={item}
                selectedItems={selectedItems}
                onSelectionChange={onSelectionChange}
                searchTerm={searchTerm}
                expandedNodes={expandedNodes}
                onExpandToggle={handleExpandToggle}
              />
            ))}
          </ul>
        ) : (
          <div className="py-8 text-center text-gray-500">
            <p>No items found matching "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckboxTree;
