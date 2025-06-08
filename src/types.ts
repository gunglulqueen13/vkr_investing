export interface Asset {
  id: string;
  ticker: string;
  name: string;
  type: 'stock' | 'bond' | 'etf';
  purchasePrice: number;
  currentPrice: number;
  quantity: number;
  purchaseDate: string;
  income?: number; 
  saleDate?: string;
  salePrice?: number;
}