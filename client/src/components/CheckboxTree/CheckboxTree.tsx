import React, { useState, useEffect, useMemo } from 'react';
import { CheckboxTreeProps, TreeItem } from './types';
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

  // Handle node expansion toggle
  const handleExpandToggle = (nodeId: string) => {
    setExpandedNodes(prev => 
      prev.includes(nodeId)
        ? prev.filter(id => id !== nodeId)
        : [...prev, nodeId]
    );
  };

  // Handle selection changes with parent auto-selection/deselection
  const handleSelectionChange = (newSelectedItems: string[]) => {
    // First propagate parents up (selection)
    const withParentsSelected = propagateSelectionToParents(newSelectedItems, items);
    // Then propagate parents down (deselection)
    const withParentsDeselected = propagateDeselectionToParents(withParentsSelected, items);
    
    onSelectionChange(withParentsDeselected);
  };
  
  // Helper to propagate selection up to parents (when all children are selected)
  const propagateSelectionToParents = (selection: string[], treeItems: TreeItem[]): string[] => {
    const selected = new Set(selection);
    const result = [...selection];
    let changed = false;
    
    // Check if all children of a node are selected
    const areAllChildrenSelected = (node: TreeItem): boolean => {
      if (!node.children || node.children.length === 0) return true;
      
      return node.children.every(child => {
        // First check if this child itself is selected
        if (!selected.has(child.id)) return false;
        
        // Then recursively check its children
        return areAllChildrenSelected(child);
      });
    };
    
    // Process nodes to auto-select parents
    const processNodes = (nodes: TreeItem[]) => {
      nodes.forEach(node => {
        // Check if all children are selected
        if (node.children && node.children.length > 0) {
          // First process deeper levels
          processNodes(node.children);
          
          // Then check current node
          if (areAllChildrenSelected(node) && !selected.has(node.id)) {
            result.push(node.id);
            selected.add(node.id);
            changed = true;
          }
        }
      });
    };
    
    // Keep processing until no more changes are made
    // This handles multi-level propagation (e.g., child → parent → grandparent)
    let iterations = 0;
    const maxIterations = 10; // Prevent infinite loops in case of circular structures
    
    do {
      changed = false;
      processNodes(treeItems);
      iterations++;
    } while (changed && iterations < maxIterations);
    
    return result;
  };
  
  // Helper to propagate deselection to parents (when all children are deselected)
  const propagateDeselectionToParents = (selection: string[], treeItems: TreeItem[]): string[] => {
    const selected = new Set(selection);
    const result = [...selection];
    let changed = false;
    
    // Get all direct children for a node
    const getChildrenIds = (node: TreeItem): string[] => {
      if (!node.children || node.children.length === 0) return [];
      return node.children.map(child => child.id);
    };
    
    // Check if node should be deselected
    const shouldNodeBeDeselected = (node: TreeItem): boolean => {
      // If node has no children, it should keep its current selection state
      if (!node.children || node.children.length === 0) return false;
      
      // If any child is selected, parent should remain selected
      const anyChildSelected = node.children.some(child => selected.has(child.id));
      
      // Parent should be deselected if it's currently selected but no children are selected
      return selected.has(node.id) && !anyChildSelected;
    };
    
    // Process nodes to auto-deselect parents
    const processNodes = (nodes: TreeItem[]) => {
      nodes.forEach(node => {
        // Process deeper levels first
        if (node.children && node.children.length > 0) {
          processNodes(node.children);
        }
        
        // Check if this node should be deselected
        if (shouldNodeBeDeselected(node)) {
          const index = result.indexOf(node.id);
          if (index !== -1) {
            result.splice(index, 1); // Remove from results
            selected.delete(node.id); // Remove from set
            changed = true;
          }
        }
      });
    };
    
    // Keep processing until no more changes are made
    let iterations = 0;
    const maxIterations = 10; // Prevent infinite loops
    
    do {
      changed = false;
      processNodes(treeItems);
      iterations++;
    } while (changed && iterations < maxIterations);
    
    return result;
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
                onSelectionChange={handleSelectionChange}
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
