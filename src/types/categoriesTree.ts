import { CategoryId } from "./categories";

export type CategoryTreeNode = {
  id: CategoryId;
  subcategories?: CategoryTreeNode[];
};

export const categoriesTree: CategoryTreeNode[] = [
  {
    id: 'bakery',
    subcategories: [
      {
        id: 'cakes',
        subcategories: [
          { id: 'cheesecakes' },
        ],
      },
      { id: 'cookies' },
    ],
  },
  { id: 'dairy' },
  { id: 'frozen' },
  { id: 'fruits' },
  { id: 'seafood' },
  { id: 'beverages' },
  { id: 'snacks' },
  { id: 'condiments' },
];
