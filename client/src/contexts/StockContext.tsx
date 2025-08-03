import { createContext, useEffect, useState, type ReactNode } from 'react';

interface StockData {
  symbol: string;
  date: string;
  close: number;
  previous_closes: { date: string; close: number }[];
}

interface StockContextType {
  stock: StockData | null;
  loading: boolean;
  error: string | null;
  refetchStock: () => void;
}

const StockContext = createContext<StockContextType | undefined>(undefined);
export const StockProvider = ({ children }: { children: ReactNode }) => {
  const [stock, setStock] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setStock(data);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message);
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
