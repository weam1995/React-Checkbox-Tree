import React, { useMemo } from 'react';
import { TreeNodeProps, TreeItem } from './types';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, ChevronRight, CheckCircle, MinusCircle, InfoIcon } from 'lucide-react';
import { highlightText } from '@/lib/treeUtils';
import { useAppSelector } from '@/store/hooks';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TreeNode: React.FC<TreeNodeProps> = ({
  item,
  selectedItems,
  onSelectionChange,
  level = 0,
  expandedNodes,
  onExpandToggle,
}) => {
  const searchTerm = useAppSelector(state => state.checkboxTree.searchTerm);
  const hasChildren = !!item.children && item.children.length > 0;
  const isExpanded = expandedNodes.includes(item.id);
  const isSelected = selectedItems.includes(item.id);
  
  // Recursively check if a node is effectively disabled
  const checkNodeDisabled = (node: TreeItem): boolean => {
    // If the node is explicitly disabled, it's disabled
    if (node.disabled) {
      return true;
    }
    
    // If the node has no children, it's not disabled
    if (!node.children || node.children.length === 0) {
      return false;
    }
    
    // For parent nodes, check if ALL children are disabled (recursively)
    return node.children.every(child => checkNodeDisabled(child));
  };
  
  // Auto-compute effective disabled state
  const effectivelyDisabled = useMemo(() => {
    return checkNodeDisabled(item);
  }, [item]);
  
  // Calculate node selection state (full, partial, or none) accounting for disabled nodes
  const { hasPartialSelection, isFullySelected } = useMemo(() => {
    if (!hasChildren) {
      return { hasPartialSelection: false, isFullySelected: isSelected };
    }
    
    // Find all selectable leaf nodes under this node (exclude disabled ones)
    const selectableLeafNodes: string[] = [];
    const allLeafNodes: string[] = [];
    
    const collectLeafNodeIds = (node: TreeItem) => {
      if (!node.children || node.children.length === 0) {
        // Always add to allLeafNodes for reference
        allLeafNodes.push(node.id);
        
        // Only add to selectable if not disabled
        if (!node.disabled) {
          selectableLeafNodes.push(node.id);
        }
      } else {
        // Process children, skipping disabled branches
        node.children.forEach(child => {
          // Process all children even if disabled (for visual state purposes)
          collectLeafNodeIds(child);
        });
      }
    };
    
    // Start with the current node's children
    item.children!.forEach(child => collectLeafNodeIds(child));
    
    // Count how many selectable leaf nodes are selected
    const selectedLeafNodes = selectableLeafNodes.filter(id => selectedItems.includes(id));
    
    // Determine selection states
    const hasAnyLeafNodeSelected = allLeafNodes.some(id => selectedItems.includes(id));
    const hasSelectedSelectableNodes = selectedLeafNodes.length > 0;
    
    // A parent is fully selected when all its *selectable* (non-disabled) leaf descendants are selected
    const allSelectableNodesSelected = selectableLeafNodes.length > 0 && 
                                       selectedLeafNodes.length === selectableLeafNodes.length;
    
    // A parent is partially selected if:
    // 1. Some but not all selectable nodes are selected, OR
    // 2. No selectable nodes exist but some disabled descendants are selected
    const partiallySelected = (hasSelectedSelectableNodes && !allSelectableNodesSelected) || 
                              (selectableLeafNodes.length === 0 && hasAnyLeafNodeSelected);
    
    return { 
      hasPartialSelection: partiallySelected, 
      isFullySelected: allSelectableNodesSelected
    };
  }, [hasChildren, item, selectedItems, isSelected]);

  const handleCheckboxChange = (checked: boolean) => {
    // If this node is disabled, don't change anything
    if (effectivelyDisabled) {
      return;
    }
    
    let newSelectedItems = [...selectedItems];
    
    if (checked) {
      // Always add the current node (both parent and leaf nodes) to the selection
      // This ensures parent nodes are selectable even during search
      if (!newSelectedItems.includes(item.id)) {
        newSelectedItems.push(item.id);
      }
      
      // If this has children, also select all selectable children
      if (hasChildren) {
        // If this is a parent node, select all non-disabled leaf nodes under it
        const selectableNodes: string[] = [];
        
        // Find all selectable nodes (non-disabled leaf nodes)
        const findSelectableNodes = (node: TreeItem) => {
          if (!node.children || node.children.length === 0) {
            // This is a leaf node - only add if not disabled
            if (!node.disabled) {
              selectableNodes.push(node.id);
            }
          } else {
            // Process children for non-disabled parent nodes
            node.children.forEach(child => {
              // Skip this branch if the direct child is disabled
              if (!child.disabled) {
                // If it's a leaf node add it directly
                if (!child.children || child.children.length === 0) {
                  selectableNodes.push(child.id);
                } else {
                  // Process this child's children recursively
                  findSelectableNodes(child);
                }
              }
            });
          }
        };
        
        // Start collection with this node's children
        findSelectableNodes(item);
        
        // Add all selectable node IDs to the selection
        selectableNodes.forEach(id => {
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
        // If this is a parent node, deselect all non-disabled leaf nodes under it
        const selectableNodes: string[] = [];
        
        // Find all selectable nodes (non-disabled leaf nodes)
        const findSelectableNodes = (node: TreeItem) => {
          if (!node.children || node.children.length === 0) {
            // This is a leaf node - only add if not disabled
            if (!node.disabled) {
              selectableNodes.push(node.id);
            }
          } else {
            // Process children for non-disabled parent nodes
            node.children.forEach(child => {
              // Skip this branch if the direct child is disabled
              if (!child.disabled) {
                // If it's a leaf node add it directly
                if (!child.children || child.children.length === 0) {
                  selectableNodes.push(child.id);
                } else {
                  // Process this child's children recursively
                  findSelectableNodes(child);
                }
              }
            });
          }
        };
        
        // Start collection with this node's children
        findSelectableNodes(item);
        
        // Remove all selectable node IDs from the selection
        newSelectedItems = newSelectedItems.filter(id => !selectableNodes.includes(id));
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
    // Don't respond to keyboard events if node is disabled
    if (effectivelyDisabled) {
      return;
    }
    
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
            {hasPartialSelection && !effectivelyDisabled ? (
              // Custom partial checkbox appearance - only for non-disabled nodes
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
                // Always show unchecked for disabled nodes
                checked={effectivelyDisabled ? false : (isFullySelected || (!hasChildren && isSelected))}
                onCheckedChange={handleCheckboxChange}
                disabled={effectivelyDisabled}
                aria-label={`Select ${item.name}`}
                className={`h-4 w-4 ${effectivelyDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            )}
          </div>
          <div className="flex items-center">
            <label
              htmlFor={item.id}
              className={`
                ml-2 
                ${effectivelyDisabled ? 'text-gray-400' : 'text-gray-700'} 
                ${level === 0 ? 'font-medium' : ''} 
                ${effectivelyDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {searchTerm && searchTerm.trim() !== '' ? (
                <>
                  {item.name.split(new RegExp(`(${searchTerm.trim()})`, 'i')).map((part, index) => 
                    part.toLowerCase() === searchTerm.trim().toLowerCase() ? 
                      <span key={index} className="bg-yellow-200">{part}</span> : 
                      <span key={index}>{part}</span>
                  )}
                </>
              ) : (
                item.name
              )}
            </label>
            
            {effectivelyDisabled && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="ml-2 inline-flex items-center">
                      <InfoIcon size={14} className="text-blue-500 cursor-help" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>This item is disabled and cannot be selected.</p>
                    {item.disabled ? (
                      <p className="text-xs mt-1 text-gray-500">This node is explicitly marked as disabled.</p>
                    ) : (
                      <p className="text-xs mt-1 text-gray-500">All children of this node are disabled.</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
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
