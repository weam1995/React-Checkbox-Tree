import React from "react";
import { 
  TreeItem, 
  CheckboxTrees
} from "@/components/CheckboxTree";
import { useAppSelector } from '@/store/hooks';
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Sample tree data for the first tree
const treeDataOne: TreeItem[] = [
  {
    id: "Websso",
    name: "Websso",
    children: [
      {
        id: "Websso.Oid.dev",
        name: "Oid.dev",
        children: [
          { id: "Websso.Oid.dev.T266622", name: "T266622", disabled: true },
          { id: "Websso.Oid.dev.T266623", name: "T266623", disabled: true },
        ],
      },
      {
        id: "Websso.Oid.prod",
        name: "Oid.prod",
        children: [
          { id: "Websso.Oid.prod.T266624", name: "T266624", disabled: false },
          { id: "Websso.Oid.prod.T266625", name: "T266625", disabled: true },
        ],
      },
    ],
  },
  {
    id: "plants",
    name: "Plants",
    children: [
      { id: "plants.roses", name: "Roses" },
      { id: "plants.sunflowers", name: "Sunflowers", disabled: true },
      { id: "plants.lilies", name: "Lilies" },
    ],
  },
  {
    id: "magical",
    name: "Magical Elements",
    children: [
      { id: "magical.fairy-lights", name: "Fairy Lights" },
      { id: "magical.glowing-mushrooms", name: "Glowing Mushrooms" },
      {
        id: "magical.nested",
        name: "Nested Magic",
        children: [
          { id: "magical.nested.item1", name: "Magic Item 1", disabled: true },
          { id: "magical.nested.item2", name: "Magic Item 2", disabled: true },
        ],
      },
      { id: "magical.crystal-formations", name: "Crystal Formations" },
    ],
  },
];

// Sample tree data for the second tree
const treeDataTwo: TreeItem[] = [
  {
    id: "animals",
    name: "Animals",
    children: [
      { id: "animals.mammals", name: "Mammals", 
        children: [
          { id: "animals.mammals.dog", name: "Dog" },
          { id: "animals.mammals.cat", name: "Cat" },
          { id: "animals.mammals.lion", name: "Lion", disabled: true },
        ] 
      },
      { id: "animals.birds", name: "Birds",
        children: [
          { id: "animals.birds.eagle", name: "Eagle" },
          { id: "animals.birds.sparrow", name: "Sparrow" },
          { id: "animals.birds.penguin", name: "Penguin", disabled: true },
        ]
      },
    ],
  },
  {
    id: "technology",
    name: "Technology",
    children: [
      { id: "technology.computers", name: "Computers" },
      { id: "technology.phones", name: "Phones" },
      { id: "technology.tablets", name: "Tablets", disabled: true },
    ],
  },
];

const Home: React.FC = () => {
  // Get selected items from Redux store for display
  const selectedItemsOne = useAppSelector(state => state.checkboxTree.selectedItemsOne);
  const selectedItemsTwo = useAppSelector(state => state.checkboxTree.selectedItemsTwo);

  // Create a display component for selected items
  const SelectedItemsDisplay = ({ items, title }: { items: string[], title: string }) => {
    if (items.length === 0) {
      return <p className="text-gray-500 italic">No items selected</p>;
    }

    return (
      <>
        <h3 className="text-md font-medium mb-2">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => {
            // Extract just the last part of the ID for display
            const parts = item.split(".");
            const name = parts[parts.length - 1]
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");

            let category = "";
            if (parts[0] === "Websso") category = "Web SSO";
            else if (parts[0] === "plants") category = "Plants";
            else if (parts[0] === "magical") category = "Magical Elements";
            else if (parts[0] === "animals") category = "Animals";
            else if (parts[0] === "technology") category = "Technology";
            else category = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);

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
      </>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-screen-xl">
      <h1 className="text-3xl font-bold mb-6 text-primary">
        CheckboxTree Component Demo
      </h1>
      
      <Card className="mb-6">
        <CardContent className="p-4 pb-0">
          <h2 className="text-2xl font-semibold mb-2 text-primary">Nature Elements</h2>
          <p className="text-sm text-gray-600 mb-4">Browse and select from our comprehensive nature catalog</p>
        
          {/* Use our new parent component that manages both trees */}
          <CheckboxTrees 
            treeOneData={treeDataOne}
            treeTwoData={treeDataTwo}
            className="mb-4"
          />
        </CardContent>
      </Card>

      <div className="md:col-span-2">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Selected Items</h2>
            <Separator className="mb-4" />
            <div className="grid grid-cols-1 gap-6">
              <h3 className="text-lg font-medium">Nature Elements Selections</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <SelectedItemsDisplay items={selectedItemsOne} title="From Plants & Magic" />
                </div>
                <div>
                  <SelectedItemsDisplay items={selectedItemsTwo} title="From Animals & Tech" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Component Features</h2>
            <Separator className="mb-4" />

            <ul className="list-disc pl-6 space-y-2">
              <li>Shared search filtering across multiple trees</li>
              <li>Hierarchical data selection with parent-child relationships</li>
              <li>Expandable/collapsible tree nodes</li>
              <li>Visual indicators for selected and expanded states</li>
              <li>Partial selection states for parent nodes</li>
              <li>Keyboard navigation support</li>
              <li>Search term highlighting</li>
              <li>Info tooltips for disabled nodes</li>
              <li>TypeScript interfaces for type safety</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;