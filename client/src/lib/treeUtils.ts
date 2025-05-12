import { TreeItem } from "@/components/CheckboxTree/types";

/**
 * Helper function to check if a node is a parent of another node
 */
export function isParentOf(parentId: string, childId: string): boolean {
  // Checks if childId starts with parentId followed by a dot
  return childId.startsWith(`${parentId}.`);
}

/**
 * Helper function to check if a node is a child of another node
 */
export function isChildOf(childId: string, parentId: string): boolean {
  return isParentOf(parentId, childId);
}

/**
 * Get all child IDs for a given item
 */
export function getAllChildIds(item: TreeItem): string[] {
  if (!item.children || item.children.length === 0) {
    return [];
  }

  const childIds: string[] = [];
  
  // Process all descendants recursively
  const processItem = (currentItem: TreeItem) => {
    if (currentItem.children && currentItem.children.length > 0) {
      currentItem.children.forEach(child => {
        childIds.push(child.id);
        processItem(child);
      });
    }
  };
  
  // Start processing from the given item
  processItem(item);
  
  return childIds;
}

/**
 * Get the parent ID from a given ID
 * Example: "plants.roses" -> "plants"
 */
export function getParentId(id: string): string | null {
  const lastDotIndex = id.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return null;
  }
  return id.substring(0, lastDotIndex);
}

/**
 * Get all parent IDs for a given ID
 * Example: "plants.flowers.roses" -> ["plants", "plants.flowers"]
 */
export function getAllParentIds(id: string): string[] {
  const parts = id.split('.');
  const parentIds: string[] = [];
  
  for (let i = 1; i < parts.length; i++) {
    parentIds.push(parts.slice(0, i).join('.'));
  }
  
  return parentIds;
}

/**
 * Check if a tree item directly matches the search term, without considering children
 */
export function itemDirectlyMatchesSearch(item: TreeItem, searchTerm: string): boolean {
  if (!searchTerm) return true;
  
  const searchLower = searchTerm.toLowerCase().trim();
  
  // Get item name and ID in lowercase for comparison
  const itemNameLower = item.name.toLowerCase();
  const itemIdLower = item.id.toLowerCase();
  const lastSegmentLower = item.id.split('.').pop()?.toLowerCase() || '';
  
  // First check if this is a potential direct search for this exact node
  if (searchLower.length > 5) { // If search term is long enough to potentially be a full node name
    // For longer search terms, require exact matching
    return searchLower === itemNameLower || 
           searchLower === itemIdLower || 
           searchLower === lastSegmentLower;
  }
  
  // For partial searches (e.g., "T", "dev", "T2666"), use substring matching
  return itemNameLower.includes(searchLower) || 
         itemIdLower.includes(searchLower) || 
         lastSegmentLower.includes(searchLower);
}

/**
 * Check if a tree item matches the search term, case insensitive
 * Supports both substring matching and exact matching depending on context
 */
export function itemMatchesSearch(item: TreeItem, searchTerm: string, path: string = ''): boolean {
  if (!searchTerm) return true;
  
  // Check if this item directly matches
  if (itemDirectlyMatchesSearch(item, searchTerm)) {
    return true;
  }
  
  // Check if any children match
  if (item.children) {
    return item.children.some(child => 
      itemMatchesSearch(child, searchTerm)
    );
  }
  
  return false;
}

/**
 * Generate a flat list of items from a hierarchical tree structure
 * This is useful for searching across the whole tree
 */
export function flattenTree(items: TreeItem[]): TreeItem[] {
  let result: TreeItem[] = [];
  
  items.forEach(item => {
    result.push(item);
    if (item.children && item.children.length > 0) {
      result = result.concat(flattenTree(item.children));
    }
  });
  
  return result;
}

/**
 * Highlight the matching text in a string with the search term
 */
export function highlightText(text: string, searchTerm: string): JSX.Element {
  if (!searchTerm) {
    return { type: 'text', props: { children: text } } as unknown as JSX.Element;
  }
  
  const searchLower = searchTerm.toLowerCase();
  const textLower = text.toLowerCase();
  const index = textLower.indexOf(searchLower);
  
  if (index === -1) {
    return { type: 'text', props: { children: text } } as unknown as JSX.Element;
  }
  
  const before = text.substring(0, index);
  const match = text.substring(index, index + searchTerm.length);
  const after = text.substring(index + searchTerm.length);
  
  return {
    type: 'fragment',
    props: {
      children: [
        before,
        { type: 'span', props: { className: "bg-yellow-200", children: match } },
        after
      ]
    }
  } as unknown as JSX.Element;
}

/**
 * Convert hierarchical array of objects to a flat array with parent-child IDs
 * Example:
 * [
 *   { id: 'plants', name: 'Plants', children: [
 *     { id: 'roses', name: 'Roses' }
 *   ]}
 * ]
 * 
 * Becomes:
 * [
 *   { id: 'plants', name: 'Plants' },
 *   { id: 'plants.roses', name: 'Roses' }
 * ]
 */
export function processTreeData(data: any[], parentId: string = ''): TreeItem[] {
  return data.map(item => {
    const currentId = parentId ? `${parentId}.${item.id}` : item.id;
    const newItem: TreeItem = {
      id: currentId,
      name: item.name,
    };
    
    if (item.children && item.children.length > 0) {
      newItem.children = processTreeData(item.children, currentId);
    }
    
    return newItem;
  });
}
