import React, { useMemo } from 'react';
import { TreeNodeProps, TreeItem } from './types';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, ChevronRight, CheckCircle, MinusCircle } from 'lucide-react';
import { highlightText } from '@/lib/treeUtils';

const TreeNode: React.FC<TreeNodeProps> = ({
  item,
  selectedItems,
  onSelectionChange,
  searchTerm = '',
  level = 0,
  expandedNodes,
  onExpandToggle,
}) => {
  const hasChildren = !!item.children && item.children.length > 0;
  const isExpanded = expandedNodes.includes(item.id);
  const isSelected = selectedItems.includes(item.id);
  
  // Calculate node selection state (full, partial, or none)
  const { hasPartialSelection, isFullySelected } = useMemo(() => {
    if (!hasChildren) {
      return { hasPartialSelection: false, isFullySelected: isSelected };
    }
    
    // Find all leaf nodes under this node
    const leafNodeIds: string[] = [];
    
    const collectLeafNodeIds = (node: TreeItem) => {
      if (!node.children || node.children.length === 0) {
        leafNodeIds.push(node.id);
      } else {
        node.children.forEach(child => collectLeafNodeIds(child));
      }
    };
    
    // Start with the current node's children
    item.children!.forEach(child => collectLeafNodeIds(child));
    
    // Count how many leaf nodes are selected
    const selectedLeafNodes = leafNodeIds.filter(id => selectedItems.includes(id));
    
    // Determine selection states
    const hasSelectedLeafNodes = selectedLeafNodes.length > 0;
    const allLeafNodesSelected = selectedLeafNodes.length === leafNodeIds.length;
    
    // A node is partially selected if some but not all of its leaf descendants are selected
    const hasPartialSelection = hasSelectedLeafNodes && !allLeafNodesSelected;
    
    // A node is fully selected if all its leaf descendants are selected
    const isFullySelected = allLeafNodesSelected;
    
    return { hasPartialSelection, isFullySelected };
  }, [hasChildren, item, selectedItems, isSelected]);

  const handleCheckboxChange = (checked: boolean) => {
    let newSelectedItems = [...selectedItems];
    
    if (checked) {
      // If this is a leaf node, select it
      if (!hasChildren) {
        if (!newSelectedItems.includes(item.id)) {
          newSelectedItems.push(item.id);
        }
      } else {
        // If this is a parent node, select all leaf nodes under it
        const leafNodeIds: string[] = [];
        
        const collectLeafNodeIds = (node: TreeItem) => {
          if (!node.children || node.children.length === 0) {
            // This is a leaf node
            leafNodeIds.push(node.id);
          } else {
            // Process children
            node.children.forEach(child => {
              collectLeafNodeIds(child);
            });
          }
        };
        
        // Start collection with this node
        collectLeafNodeIds(item);
        
        // Add all leaf node IDs to the selection
        leafNodeIds.forEach(id => {
          if (!newSelectedItems.includes(id)) {
            newSelectedItems.push(id);
          }
        });
      }
    } else {
      // If this is a leaf node, deselect it
      if (!hasChildren) {
        newSelectedItems = newSelectedItems.filter(id => id !== item.id);
      } else {
        // If this is a parent node, deselect all leaf nodes under it
        const leafNodeIds: string[] = [];
        
        const collectLeafNodeIds = (node: TreeItem) => {
          if (!node.children || node.children.length === 0) {
            // This is a leaf node
            leafNodeIds.push(node.id);
          } else {
            // Process children
            node.children.forEach(child => {
              collectLeafNodeIds(child);
            });
          }
        };
        
        // Start collection with this node
        collectLeafNodeIds(item);
        
        // Remove all leaf node IDs from the selection
        newSelectedItems = newSelectedItems.filter(id => !leafNodeIds.includes(id));
      }
    }
    
    // Update selection
    onSelectionChange(newSelectedItems);
  };

  const handleExpandToggle = () => {
    if (hasChildren) {
      onExpandToggle(item.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (hasChildren) {
        handleCheckboxChange(!isFullySelected);
      } else {
        handleCheckboxChange(!isSelected);
      }
      e.preventDefault();
    } else if (e.key === 'ArrowRight' && hasChildren && !isExpanded) {
      onExpandToggle(item.id);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && hasChildren && isExpanded) {
      onExpandToggle(item.id);
      e.preventDefault();
    }
  };

  return (
    <li className="mb-1">
      <div 
        className="flex items-center p-2 hover:bg-gray-50 rounded-md" 
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {hasChildren ? (
          <button
            type="button"
            className="w-6 h-6 flex items-center justify-center text-primary mr-1"
            onClick={handleExpandToggle}
            aria-label={isExpanded ? `Collapse ${item.name}` : `Expand ${item.name}`}
            tabIndex={-1}
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : (
          <div className="w-6 h-6" />
        )}
        
        <div className="flex items-center ml-1">
          <div className="relative flex items-center">
            {hasPartialSelection ? (
              // Custom partial checkbox appearance
              <div 
                className="w-4 h-4 rounded-sm bg-primary/40 border border-primary/70 flex items-center justify-center cursor-pointer"
                onClick={() => handleCheckboxChange(!isFullySelected)}
              >
                <MinusCircle 
                  size={12} 
                  className="text-white pointer-events-none" 
                />
              </div>
            ) : (
              // Regular checkbox
              <Checkbox
                id={item.id}
                checked={isFullySelected || (!hasChildren && isSelected)}
                onCheckedChange={handleCheckboxChange}
                aria-label={`Select ${item.name}`}
                className="h-4 w-4"
              />
            )}
          </div>
          <label
            htmlFor={item.id}
            className={`ml-2 text-gray-700 ${level === 0 ? 'font-medium' : ''} cursor-pointer`}
          >
            {searchTerm ? (
              <span dangerouslySetInnerHTML={{ 
                __html: item.name.replace(
                  new RegExp(searchTerm, 'gi'), 
                  match => `<span class="bg-yellow-200">${match}</span>`
                ) 
              }} />
            ) : (
              item.name
            )}
          </label>
        </div>
      </div>
      
      {hasChildren && isExpanded && (
        <ul className="pl-8">
          {item.children!.map(child => (
            <TreeNode
              key={child.id}
              item={child}
              selectedItems={selectedItems}
              onSelectionChange={onSelectionChange}
              searchTerm={searchTerm}
              level={level + 1}
              expandedNodes={expandedNodes}
              onExpandToggle={onExpandToggle}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default TreeNode;
