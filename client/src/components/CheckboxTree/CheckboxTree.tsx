import React, { useState, useEffect } from 'react';
import { CheckboxTreeProps, TreeItem } from './types';
import TreeNode from './TreeNode';
import { itemMatchesSearch, itemDirectlyMatchesSearch } from '@/lib/treeUtils';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { 
  setIsTreeOneEmpty, 
  setIsTreeTwoEmpty,
  setExpandedNodesOne,
  setExpandedNodesTwo,
  toggleNodeExpansionOne,
  toggleNodeExpansionTwo
} from '@/store/checkboxTreeSlice';

const CheckboxTree: React.FC<CheckboxTreeProps> = ({
  items,
  selectedItems,
  onSelectionChange,
  className = '',
  title,
  treeIndex,
}) => {
  const searchTerm = useAppSelector(state => state.checkboxTree.searchTerm);
  const expandedNodesOne = useAppSelector(state => state.checkboxTree.expandedNodesOne);
  const expandedNodesTwo = useAppSelector(state => state.checkboxTree.expandedNodesTwo);
  const dispatch = useAppDispatch();
  
  const [filteredItems, setFilteredItems] = useState(items);
  
  // Get the correct expanded nodes based on tree index
  const expandedNodes = treeIndex === 1 ? expandedNodesOne : expandedNodesTwo;
  
  // Handle toggling node expansion
  const handleToggleExpand = (nodeId: string) => {
    if (treeIndex === 1) {
      dispatch(toggleNodeExpansionOne(nodeId));
    } else if (treeIndex === 2) {
      dispatch(toggleNodeExpansionTwo(nodeId));
    }
  };

  // Filter items based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredItems(items);
      return;
    }

    // Identify all nodes that match the search term directly or have matching descendants
    const findMatchingNodes = (items: TreeItem[]): Set<string> => {
      const matchingNodeIds = new Set<string>();
      
      // Recursive helper to check if a node or its descendants match
      const checkNodeAndDescendants = (node: TreeItem): boolean => {
        // Check if this node matches directly
        const directMatch = itemDirectlyMatchesSearch(node, searchTerm);
        
        if (directMatch) {
          matchingNodeIds.add(node.id);
          return true;
        }
        
        // Check descendants
        let hasMatchingDescendant = false;
        if (node.children && node.children.length > 0) {
          for (const child of node.children) {
            if (checkNodeAndDescendants(child)) {
              hasMatchingDescendant = true;
            }
          }
        }
        
        // If any descendants match, mark this node too
        if (hasMatchingDescendant) {
          matchingNodeIds.add(node.id);
        }
        
        return directMatch || hasMatchingDescendant;
      };
      
      // Check all root nodes
      items.forEach(item => checkNodeAndDescendants(item));
      
      return matchingNodeIds;
    };
    
    // Get all node IDs that match the search or have matching descendants
    const matchingNodeIds = findMatchingNodes(items);
    
    // Filter the tree to only include matching nodes and their parents
    const createFilteredTree = (items: TreeItem[]): TreeItem[] => {
      return items
        .map(item => {
          // Include this node if it matches or has matching descendants
          if (matchingNodeIds.has(item.id)) {
            // Filter children recursively
            let filteredChildren: TreeItem[] = [];
            
            if (item.children && item.children.length > 0) {
              filteredChildren = createFilteredTree(item.children);
            }
            
            return {
              ...item,
              children: filteredChildren
            };
          }
          
          // Filter out this node and its subtree
          return null;
        })
        .filter(Boolean) as TreeItem[]; // Remove null items
    };
    
    // Create the filtered tree
    const filtered = createFilteredTree(items);
    setFilteredItems(filtered);
    
    // Notify parent about empty state if needed
    if (treeIndex === 1) {
      dispatch(setIsTreeOneEmpty(filtered.length === 0));
    } else if (treeIndex === 2) {
      dispatch(setIsTreeTwoEmpty(filtered.length === 0));
    }
    
    // Ensure all nodes in the filtered tree with children are expanded
    // and all parents of matching leaf nodes are expanded
    const nodesToExpand = new Set<string>();
    
    // First add all parent nodes to the expansion set
    filtered.forEach(item => {
      // Parent nodes should always be expanded
      if (item.children && item.children.length > 0) {
        nodesToExpand.add(item.id);
      }
      
      // Process all nodes in the tree
      const processNode = (node: TreeItem, path: string) => {
        // If this node has children, expand it
        if (node.children && node.children.length > 0) {
          nodesToExpand.add(path);
          
          // Process children
          node.children.forEach(child => {
            const childPath = path ? `${path}.${child.id}` : child.id;
            processNode(child, childPath);
          });
        }
      };
      
      // Start with this root node
      processNode(item, item.id);
    });
    
    // Set the expanded nodes state
    const expansionArray = Array.from(nodesToExpand);
    if (treeIndex === 1) {
      dispatch(setExpandedNodesOne(expansionArray));
    } else if (treeIndex === 2) {
      dispatch(setExpandedNodesTwo(expansionArray));
    }
  }, [searchTerm, items, dispatch, treeIndex]);

  // No longer need handleSearchChange - using Redux now

  // Handle node expansion toggle
  const handleExpandToggle = (nodeId: string) => {
    // Using the helper function we created earlier
    handleToggleExpand(nodeId);
  };

  // Handle selection changes - keeping only leaf nodes in the selection array
  const handleSelectionChange = (newSelectedItems: string[]) => {
    // If we're searching, we need to handle differently to ensure parent nodes can be selected
    if (searchTerm) {
      // When searching, we need to use the filtered items to determine what's a leaf node
      const leafNodesOnly = filterToLeafNodesOnly(newSelectedItems, filteredItems);
      
      // If the selected item is a direct parent of filtered items, we should select it
      const directParentSelection = newSelectedItems.filter(id => {
        // Check if this is a parent node by seeing if it exists in the original items
        const isParentNode = items.find(item => item.id === id);
        // If it's a parent node and not in the leaf nodes, add it
        return isParentNode && !leafNodesOnly.includes(id);
      });
      
      // Combine both leaf nodes and parent nodes that were directly selected
      onSelectionChange([...leafNodesOnly, ...directParentSelection]);
    } else {
      // Normal behavior when not searching - extract only leaf nodes
      const leafNodesOnly = filterToLeafNodesOnly(newSelectedItems, items);
      onSelectionChange(leafNodesOnly);
    }
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
      
      // If we can't find the node in the current tree items (this can happen during search),
      // then it could be a node from the original tree that's not in the filtered list
      if (!node) {
        // In this case, we'll assume it's a valid selection (especially for search cases)
        return true;
      }
      
      // Include the ID if it's a leaf node (no children)
      return !node.children || node.children.length === 0;
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
    
    // Update the Redux store based on tree index
    if (treeIndex === 1) {
      dispatch(setExpandedNodesOne(allExpandableNodes));
    } else if (treeIndex === 2) {
      dispatch(setExpandedNodesTwo(allExpandableNodes));
    }
  };

  // Helper to collapse all nodes
  const collapseAll = () => {
    // Update the Redux store based on tree index
    if (treeIndex === 1) {
      dispatch(setExpandedNodesOne([]));
    } else if (treeIndex === 2) {
      dispatch(setExpandedNodesTwo([]));
    }
  };

  return (
    <div className={`checkbox-tree ${className}`}>
      {title && (
        <div className="p-3 border-b bg-primary-50">
          <h3 className="text-sm font-medium text-primary">{title}</h3>
        </div>
      )}
      
      <div className="overflow-y-auto p-2">
        {filteredItems.length > 0 ? (
          <ul className="checkbox-tree-list">
            {filteredItems.map(item => (
              <TreeNode
                key={item.id}
                item={item}
                selectedItems={selectedItems}
                onSelectionChange={handleSelectionChange}
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