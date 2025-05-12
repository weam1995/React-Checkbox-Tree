import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TreeItem } from '@/components/CheckboxTree/types';

interface CheckboxTreeState {
  searchTerm: string;
  isTreeOneEmpty: boolean;
  isTreeTwoEmpty: boolean;
  selectedItemsOne: string[];
  selectedItemsTwo: string[];
  expandedNodesOne: string[];
  expandedNodesTwo: string[];
}

const initialState: CheckboxTreeState = {
  searchTerm: '',
  isTreeOneEmpty: false,
  isTreeTwoEmpty: false,
  selectedItemsOne: ["plants.roses", "magical.fairy-lights"],
  selectedItemsTwo: ["animals.mammals.dog", "technology.computers"],
  expandedNodesOne: [],
  expandedNodesTwo: []
};

export const checkboxTreeSlice = createSlice({
  name: 'checkboxTree',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setIsTreeOneEmpty: (state, action: PayloadAction<boolean>) => {
      state.isTreeOneEmpty = action.payload;
    },
    setIsTreeTwoEmpty: (state, action: PayloadAction<boolean>) => {
      state.isTreeTwoEmpty = action.payload;
    },
    setSelectedItemsOne: (state, action: PayloadAction<string[]>) => {
      state.selectedItemsOne = action.payload;
    },
    setSelectedItemsTwo: (state, action: PayloadAction<string[]>) => {
      state.selectedItemsTwo = action.payload;
    },
    setExpandedNodesOne: (state, action: PayloadAction<string[]>) => {
      state.expandedNodesOne = action.payload;
    },
    toggleNodeExpansionOne: (state, action: PayloadAction<string>) => {
      const nodeId = action.payload;
      if (state.expandedNodesOne.includes(nodeId)) {
        state.expandedNodesOne = state.expandedNodesOne.filter(id => id !== nodeId);
      } else {
        state.expandedNodesOne = [...state.expandedNodesOne, nodeId];
      }
    },
    setExpandedNodesTwo: (state, action: PayloadAction<string[]>) => {
      state.expandedNodesTwo = action.payload;
    },
    toggleNodeExpansionTwo: (state, action: PayloadAction<string>) => {
      const nodeId = action.payload;
      if (state.expandedNodesTwo.includes(nodeId)) {
        state.expandedNodesTwo = state.expandedNodesTwo.filter(id => id !== nodeId);
      } else {
        state.expandedNodesTwo = [...state.expandedNodesTwo, nodeId];
      }
    }
  }
});

export const {
  setSearchTerm,
  setIsTreeOneEmpty,
  setIsTreeTwoEmpty,
  setSelectedItemsOne,
  setSelectedItemsTwo,
  setExpandedNodesOne,
  toggleNodeExpansionOne,
  setExpandedNodesTwo,
  toggleNodeExpansionTwo
} = checkboxTreeSlice.actions;

export default checkboxTreeSlice.reducer;