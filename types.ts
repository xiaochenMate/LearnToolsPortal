export type Category = 'education' | 'entertainment' | 'utilities';

export interface AppItem {
  id: string;
  title: string;
  author: string;
  category: Category;
  imageUrl: string;
  description: string;
  tags: string[];
}
