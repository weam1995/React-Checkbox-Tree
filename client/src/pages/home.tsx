import React, { useState } from 'react';
import { CheckboxTree, TreeItem } from '@/components/CheckboxTree';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// Sample tree data
const treeData: TreeItem[] = [
  {
    id: 'Websso',
    name: 'Websso',
    children: [
      { 
        id: 'Websso.Oid.dev', 
        name: 'Oid.dev',
        children: [
          { id: 'Websso.Oid.dev.T266622', name: 'T266622', disabled: true }
        ] 
      }
    ]
  },
  {
    id: 'plants',
    name: 'Plants',
    children: [
      { id: 'plants.roses', name: 'Roses' },
      { id: 'plants.sunflowers', name: 'Sunflowers', disabled: true },
      { id: 'plants.lilies', name: 'Lilies' }
    ]
  },
  {
    id: 'magical',
    name: 'Magical Elements',
    children: [
      { id: 'magical.fairy-lights', name: 'Fairy Lights' },
      { id: 'magical.glowing-mushrooms', name: 'Glowing Mushrooms' },
      { id: 'magical.crystal-formations', name: 'Crystal Formations' }
    ]
  }
];

const Home: React.FC = () => {
  const [selectedItems, setSelectedItems] = useState<string[]>([
    'Websso.Oid.dev.T266622',
    'plants.roses',
    'magical.fairy-lights'
  ]);

  const handleSelectionChange = (newSelectedItems: string[]) => {
    setSelectedItems(newSelectedItems);
    console.log('Selected items:', newSelectedItems);
  };

  // Create a display component for selected items
  const SelectedItemsDisplay = () => {
    if (selectedItems.length === 0) {
      return <p className="text-gray-500 italic">No items selected</p>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {selectedItems.map(item => {
          // Extract just the last part of the ID for display
          const parts = item.split('.');
          const name = parts[parts.length - 1].split('-').map(
            word => word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');
          
          let category = '';
          if (parts[0] === 'Websso') category = 'Web SSO';
          else if (parts[0] === 'plants') category = 'Plants';
          else if (parts[0] === 'magical') category = 'Magical Elements';
          else if (parts[0] === 'decorations') category = 'Decorations';
          
          return (
            <Card key={item} className="overflow-hidden">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-primary">{name}</h3>
                <p className="text-sm text-gray-500">{category}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-screen-xl">
      <h1 className="text-3xl font-bold mb-6 text-primary">CheckboxTree Component Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardContent className="p-0">
              <CheckboxTree
                items={treeData}
                selectedItems={selectedItems}
                onSelectionChange={handleSelectionChange}
                searchPlaceholder="Search tree items..."
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Selected Items</h2>
              <Separator className="mb-4" />
              <SelectedItemsDisplay />
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Component Features</h2>
              <Separator className="mb-4" />
              
              <ul className="list-disc pl-6 space-y-2">
                <li>Search functionality to filter tree nodes</li>
                <li>Hierarchical data selection with parent-child relationships</li>
                <li>Expandable/collapsible tree nodes</li>
                <li>Visual indicators for selected and expanded states</li>
                <li>Partial selection states for parent nodes</li>
                <li>Keyboard navigation support</li>
                <li>Search term highlighting</li>
                <li>TypeScript interfaces for type safety</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
