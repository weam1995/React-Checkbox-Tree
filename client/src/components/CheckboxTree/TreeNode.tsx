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
  const { hasPartialSelection, hasSomeSelection } = useMemo(() => {
    if (!hasChildren) {
      return { hasPartialSelection: false, hasSomeSelection: isSelected };
    }
    
    // Get direct children IDs
    const directChildrenIds = item.children!.map(child => child.id);
    
    // Get all descendant IDs (for deeper levels)
    const allDescendantIds: string[] = [];
    
    const collectAllDescendantIds = (node: TreeItem) => {
      if (node.children && node.children.length > 0) {
        node.children.forEach((child: TreeItem) => {
          allDescendantIds.push(child.id);
          collectAllDescendantIds(child);
        });
      }
    };
    
    collectAllDescendantIds(item);
    
    // Check various selection states
    const directChildrenSelected = directChildrenIds.filter(id => selectedItems.includes(id));
    const hasSelectedDirectChild = directChildrenSelected.length > 0;
    const allDirectChildrenSelected = directChildrenSelected.length === directChildrenIds.length;
    
    const hasAnyDescendantSelected = allDescendantIds.some(id => selectedItems.includes(id));
    
    // Determine if this is a partial selection
    // A node has partial selection if:
    // 1. Some, but not all, direct children are selected, OR
    // 2. At least one descendant is selected but the node itself is not selected
    const hasPartialChildren = hasSelectedDirectChild && !allDirectChildrenSelected;
    const hasPartialSelection = hasPartialChildren || (hasAnyDescendantSelected && !isSelected);
    
    // Determine if this node has any selection (itself or descendants)
    const hasSomeSelection = isSelected || hasAnyDescendantSelected;
    
    return { hasPartialSelection, hasSomeSelection };
  }, [hasChildren, item, selectedItems, isSelected]);

  const handleCheckboxChange = (checked: boolean) => {
    let newSelectedItems = [...selectedItems];
    
    if (checked) {
      // Select this item
      if (!newSelectedItems.includes(item.id)) {
        newSelectedItems.push(item.id);
      }
      
      // Select all children recursively
      if (hasChildren) {
        // Get direct children
        item.children?.forEach((child: TreeItem) => {
          if (!newSelectedItems.includes(child.id)) {
            newSelectedItems.push(child.id);
          }
          
          // Process this child's children recursively
          const processChildren = (node: TreeItem) => {
            if (node.children && node.children.length > 0) {
              node.children.forEach((subChild: TreeItem) => {
                if (!newSelectedItems.includes(subChild.id)) {
                  newSelectedItems.push(subChild.id);
                }
                processChildren(subChild);
              });
            }
          };
          
          processChildren(child);
        });
      }
    } else {
      // Deselect this item
      newSelectedItems = newSelectedItems.filter(id => id !== item.id);
      
      // Deselect all children recursively
      if (hasChildren) {
        // Process children recursively to get all descendant IDs
        const descendantIds: string[] = [];
        
        const collectDescendantIds = (node: TreeItem) => {
          if (node.children && node.children.length > 0) {
            node.children.forEach((child: TreeItem) => {
              descendantIds.push(child.id);
              collectDescendantIds(child);
            });
          }
        };
        
        collectDescendantIds(item);
        
        // Remove all descendants from selected items
        newSelectedItems = newSelectedItems.filter(id => !descendantIds.includes(id));
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
      handleCheckboxChange(!isSelected);
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
                onClick={() => handleCheckboxChange(!isSelected)}
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
                checked={isSelected}
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
