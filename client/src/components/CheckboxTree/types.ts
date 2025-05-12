/**
 * Types for the CheckboxTree component
 */

/**
 * TreeItem represents a single node in the tree
 */
export interface TreeItem {
  /**
   * Unique identifier for the item
   */
  id: string;
  /**
   * Display name for the item
   */
  name: string;
  /**
   * Children items for nested structure
   */
  children?: TreeItem[];
  /**
   * Whether the node is disabled (cannot be selected/deselected)
   */
  disabled?: boolean;
}

/**
 * Props for the CheckboxTree component
 */
export interface CheckboxTreeProps {
  /**
   * The array of tree items to display
   */
  items: TreeItem[];
  /**
   * Array of currently selected item IDs
   */
  selectedItems: string[];
  /**
   * Optional function to handle selection changes
   */
  onSelectionChange: (selectedItems: string[]) => void;
  /**
   * Optional title for the tree
   */
  title?: string;
  /**
   * Optional className for additional styling
   */
  className?: string;
  /**
   * Optional tree index for multi-tree coordination
   */
  treeIndex?: number;
}

/**
 * Props for the SearchBox component
 */
export interface SearchBoxProps {
  /**
   * Value of the search input
   */
  value: string;
  /**
   * Function to handle search changes
   */
  onChange: (value: string) => void;
  /**
   * Optional placeholder text
   */
  placeholder?: string;
  /**
   * Optional className for additional styling
   */
  className?: string;
}

/**
 * Props for the TreeNode component
 */
export interface TreeNodeProps {
  /**
   * The item to display
   */
  item: TreeItem;
  /**
   * Array of currently selected item IDs
   */
  selectedItems: string[];
  /**
   * Function to handle selection changes
   */
  onSelectionChange: (selectedItems: string[]) => void;
  /**
   * Level of nesting (used for indentation)
   */
  level?: number;
  /**
   * Array of expanded node IDs
   */
  expandedNodes: string[];
  /**
   * Function to toggle expansion of a node
   */
  onExpandToggle: (id: string) => void;
}
