/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState, type ReactNode } from 'react';

export interface StockData {
  symbol: string;
  date: string;
  close: number;
  previous_closes: { date: string; close: number }[];
}

export interface StockContextType {
  stock: StockData | null;
  loading: boolean;
  error: string | null;
  refetchStock: () => void;
}

export const StockContext = createContext<StockContextType | undefined>(
  undefined
);

export const StockProvider = ({ children }: { children: ReactNode }) => {
  const [stock, setStock] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatStockData = (data: any): StockData => {
    return {
      symbol: data.symbol,
      date: data.date,
      close: parseFloat(data.close.toFixed(2)),
      previous_closes:
        data.previous_closes?.map((item: any) => ({
          date: item.date,
          close: parseFloat(item.close.toFixed(2)),
        })) || [],
    };
  };

  const fetchStock = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/random-stock');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to fetch stock data`);
      }
      const data = await res.json();
      if (!data.symbol || !data.date || typeof data.close !== 'number') {
        throw new Error('Invalid stock data format');
      }
      // Format the stock data to 2 decimal places
      const formattedStock: StockData = formatStockData(data);

      setStock(formattedStock);
    } catch (err) {
      console.error('Fetch error:', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  return (
    <StockContext.Provider
      value={{
        stock,
        loading,
        error,
        refetchStock: fetchStock,
      }}
    >
      {children}
    </StockContext.Provider>
  );
};
