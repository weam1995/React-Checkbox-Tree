import React, { useMemo } from 'react';
import { TreeNodeProps } from './types';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { highlightText, getAllChildIds } from '@/lib/treeUtils';

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
  
  // Calculate if some (but not all) children are selected
  const hasPartialSelection = useMemo(() => {
    if (!hasChildren) return false;
    
    const childIds = getAllChildIds(item);
    const hasSelectedChild = childIds.some(id => selectedItems.includes(id));
    const allChildrenSelected = childIds.every(id => selectedItems.includes(id));
    
    return hasSelectedChild && !allChildrenSelected;
  }, [hasChildren, item, selectedItems]);

  const handleCheckboxChange = (checked: boolean) => {
    let newSelectedItems = [...selectedItems];
    
    if (checked) {
      // Select this item
      if (!newSelectedItems.includes(item.id)) {
        newSelectedItems.push(item.id);
      }
      
      // Select all children
      if (hasChildren) {
        const childIds = getAllChildIds(item);
        childIds.forEach(childId => {
          if (!newSelectedItems.includes(childId)) {
            newSelectedItems.push(childId);
          }
        });
      }
    } else {
      // Deselect this item
      newSelectedItems = newSelectedItems.filter(id => id !== item.id);
      
      // Deselect all children
      if (hasChildren) {
        const childIds = getAllChildIds(item);
        newSelectedItems = newSelectedItems.filter(id => !childIds.includes(id));
      }
    }
    
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
          <Checkbox
            id={item.id}
            checked={isSelected}
            onCheckedChange={handleCheckboxChange}
            aria-label={`Select ${item.name}`}
            className={`${hasPartialSelection && !isSelected ? 'bg-primary/50 text-white' : ''}`}
          />
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
