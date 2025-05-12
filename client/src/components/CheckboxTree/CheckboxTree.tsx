import React, { useState, useEffect, useMemo } from 'react';
import { CheckboxTreeProps, TreeItem } from './types';
import SearchBox from './SearchBox';
import TreeNode from './TreeNode';
import { itemMatchesSearch, itemDirectlyMatchesSearch } from '@/lib/treeUtils';

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

    // Create a filtered tree that only includes matching nodes and their parents
    const createFilteredTree = (items: TreeItem[]): TreeItem[] => {
      return items
        .map(item => {
          // Check if this item matches directly
          const itemMatches = itemDirectlyMatchesSearch(item, searchTerm);
          
          // If it has children, filter them recursively
          let filteredChildren: TreeItem[] = [];
          
          if (item.children && item.children.length > 0) {
            // Only include children that match the search term directly
            filteredChildren = item.children
              .filter(child => itemDirectlyMatchesSearch(child, searchTerm) || 
                               (child.children && child.children.length > 0 && 
                                child.children.some(grandchild => itemMatchesSearch(grandchild, searchTerm))))
              .map(child => {
                // If this child has children, filter them recursively
                if (child.children && child.children.length > 0) {
                  return {
                    ...child,
                    children: createFilteredTree(child.children)
                  };
                }
                // Leaf node that matches directly
                return child;
              });
          }
          
          // Keep this item if:
          // 1. It matches the search directly, OR
          // 2. It has children that match after filtering
          if (itemMatches || filteredChildren.length > 0) {
            return {
              ...item,
              children: filteredChildren
            };
          }
          
          // Filter out this item completely
          return null;
        })
        .filter(Boolean) as TreeItem[]; // Remove null items
    };
    
    // Apply the filtering
    const filtered = createFilteredTree(items);
    setFilteredItems(filtered);

    // Auto-expand all nodes in the filtered tree AND all nodes that have matching children
    const nodesToExpand = new Set<string>();
    
    // First pass: find all nodes that have matching descendants
    const findNodesWithMatchingDescendants = (allItems: TreeItem[], searchTerm: string) => {
      const nodeIdsWithMatches = new Set<string>();
      
      const traverse = (node: TreeItem, parentIds: string[] = []) => {
        // Check if this node matches the search term
        if (itemDirectlyMatchesSearch(node, searchTerm)) {
          // If there's a match, mark all ancestors as having matching descendants
          parentIds.forEach(id => nodeIdsWithMatches.add(id));
        }
        
        // Recursively check children
        if (node.children && node.children.length > 0) {
          node.children.forEach(child => {
            traverse(child, [...parentIds, node.id]);
          });
        }
      };
      
      // Start traversal from all root nodes
      allItems.forEach(item => traverse(item, []));
      return nodeIdsWithMatches;
    };
    
    // Get all node IDs that have matching descendants
    const nodesWithMatchingDescendants = findNodesWithMatchingDescendants(items, searchTerm);
    
    // Second pass: mark all appropriate nodes for expansion
    const findAndExpandAllNodes = (items: TreeItem[], parentPath = '') => {
      items.forEach(item => {
        const fullPath = parentPath ? `${parentPath}.${item.id}` : item.id;
        
        // Add all parent paths to be expanded
        const parts = fullPath.split('.');
        for (let i = 1; i < parts.length; i++) {
          nodesToExpand.add(parts.slice(0, i).join('.'));
        }
        
        // Add this node to be expanded if:
        // 1. It has children in the filtered tree, OR
        // 2. It has matching descendants in the full tree
        if (item.children?.length || nodesWithMatchingDescendants.has(item.id)) {
          nodesToExpand.add(fullPath);
        }
        
        // Recursively process children
        if (item.children?.length) {
          findAndExpandAllNodes(item.children, fullPath);
        }
      });
    };
    
    findAndExpandAllNodes(filtered);
    setExpandedNodes(Array.from(nodesToExpand));
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

  // Handle selection changes - keeping only leaf nodes in the selection array
  const handleSelectionChange = (newSelectedItems: string[]) => {
    // Extract only leaf nodes (nodes without children)
    const leafNodesOnly = filterToLeafNodesOnly(newSelectedItems, items);
    
    // Pass the leaf nodes to the consumer
    onSelectionChange(leafNodesOnly);
  };
  
  // Get all leaf nodes in the tree
  const getAllLeafNodes = (treeItems: TreeItem[]): string[] => {
    const leafNodes: string[] = [];
    
    const collectLeafNodes = (nodes: TreeItem[]) => {
      nodes.forEach(node => {
        // If node has no children, it's a leaf node
        if (!node.children || node.children.length === 0) {
          leafNodes.push(node.id);
        } else {
          // Process children nodes
          collectLeafNodes(node.children);
        }
      });
    };
    
    collectLeafNodes(treeItems);
    return leafNodes;
  };
  
  // Filter an array of node IDs to only include leaf nodes
  const filterToLeafNodesOnly = (selectedIds: string[], treeItems: TreeItem[]): string[] => {
    // Build a map of all nodes for quick lookups
    const nodeMap = new Map<string, TreeItem>();
    
    const buildNodeMap = (nodes: TreeItem[], parentPath = '') => {
      nodes.forEach(node => {
        const path = node.id;
        nodeMap.set(path, node);
        
        if (node.children && node.children.length > 0) {
          buildNodeMap(node.children, path);
        }
      });
    };
    
    buildNodeMap(treeItems);
    
    // Filter to include only leaf nodes from the selection
    return selectedIds.filter(id => {
      const node = nodeMap.get(id);
      // Include the ID if it's a leaf node (no children)
      return node && (!node.children || node.children.length === 0);
    });
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
