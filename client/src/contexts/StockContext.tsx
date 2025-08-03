/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

export interface StockData {
  symbol: string;
  date: string;
  close: number;
  previous_closes: { date: string; close: number }[];
}

interface StockAPIResponse {
  ticker: string;
  data: {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
}

export interface StockContextType {
  stock: StockData | null;
  loading: boolean;
  error: string | null;
  ticker: string;
  duration: number;
  endDate: string;
  setEndDate: (endDate: string) => void;
  setTicker: (ticker: string) => void;
  setDuration: (duration: number) => void;
  fetchStock: (ticker?: string, duration?: number, endDate?: string) => void;
}

export const StockContext = createContext<StockContextType | undefined>(
  undefined
);

export const StockProvider = ({ children }: { children: ReactNode }) => {
  const [stock, setStock] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticker, setTicker] = useState('');
  const [duration, setDuration] = useState(30);
  const [endDate, setEndDate] = useState('');

  const formatStockData = (data: {
    symbol: string;
    date: string;
    close: number;
    previous_closes?: { date: string; close: number }[];
  }): StockData => {
    return {
      symbol: data.symbol,
      date: data.date,
      close: parseFloat(data.close.toFixed(2)),
      previous_closes:
        data.previous_closes?.map((item: { date: string; close: number }) => ({
          date: item.date,
          close: parseFloat(item.close.toFixed(2)),
        })) || [],
    };
  };

  const fetchStock = useCallback(
    async (newTicker?: string, newDuration?: number, newEndDate?: string) => {
      const targetTicker = newTicker || ticker;
      const targetDuration = newDuration || duration;
      const targetEndDate = newEndDate || endDate;

      if (!targetTicker || !targetEndDate) return;

      setLoading(true);
      setError(null);

      try {
        // Calculate start date based on duration and end date
        const endDateObj = new Date(targetEndDate);
        const startDate = new Date(endDateObj);
        startDate.setDate(endDateObj.getDate() - targetDuration);

        const params = new URLSearchParams({
          ticker: targetTicker,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDateObj.toISOString().split('T')[0],
        });

        const res = await fetch(`/api/stock?${params}`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: Failed to fetch stock data`);
        }
        const response: StockAPIResponse = await res.json();
        console.log('Fetched stock data:', response);

        // Handle the new data structure: { ticker: string, data: [...] }
        if (
          !response.ticker ||
          !response.data ||
          !Array.isArray(response.data) ||
          response.data.length === 0
        ) {
          throw new Error('Invalid stock data format');
        }

        // Get the most recent data point (last item in array)
        const latestData = response.data[response.data.length - 1];

        // Format the data to match our StockData interface
        const formattedData = {
          symbol: response.ticker,
          date: latestData.date,
          close: latestData.close,
          previous_closes: response.data
            .slice(0, -1)
            .map((item: { date: string; close: number }) => ({
              date: item.date,
              close: item.close,
            })),
        };

        // Format the stock data to 2 decimal places
        const formattedStock: StockData = formatStockData(formattedData);

        setStock(formattedStock);
        if (newTicker) setTicker(newTicker);
        if (newDuration) setDuration(newDuration);
        if (newEndDate) setEndDate(newEndDate);
      } catch (err) {
        console.error('Fetch error:', err);
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [ticker, duration, endDate]
  );

  useEffect(() => {
    // Set random initial values on load - only run once
    const randomTickers = [
      'AAPL',
      'GOOGL',
      'MSFT',
      'AMZN',
      'TSLA',
      'META',
      'NVDA',
      'NFLX',
    ];
    const randomDurations = [5, 10, 20, 30, 60];

    const randomTicker =
      randomTickers[Math.floor(Math.random() * randomTickers.length)];
    const randomDuration =
      randomDurations[Math.floor(Math.random() * randomDurations.length)];
    
    // Generate random end date within the last 2 years
    const today = new Date();
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(today.getFullYear() - 2);
    
    const randomTime = twoYearsAgo.getTime() + Math.random() * (today.getTime() - twoYearsAgo.getTime());
    const randomEndDate = new Date(randomTime).toISOString().split('T')[0];

    setTicker(randomTicker);
    setDuration(randomDuration);
    setEndDate(randomEndDate);

    // Call fetchStock directly with the random values
    const fetchInitialStock = async () => {
      setLoading(true);
      setError(null);

      try {
        // Calculate start date based on duration and random end date
        const endDateObj = new Date(randomEndDate);
        const startDate = new Date(endDateObj);
        startDate.setDate(endDateObj.getDate() - randomDuration);

        const params = new URLSearchParams({
          ticker: randomTicker,
          start_date: startDate.toISOString().split('T')[0],
          end_date: randomEndDate,
        });

        const res = await fetch(`/api/stock?${params}`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: Failed to fetch stock data`);
        }
        const response: StockAPIResponse = await res.json();
        console.log('Fetched initial stock data:', response);

        // Handle the new data structure: { ticker: string, data: [...] }
        if (
          !response.ticker ||
          !response.data ||
          !Array.isArray(response.data) ||
          response.data.length === 0
        ) {
          throw new Error('Invalid stock data format');
        }

        // Get the most recent data point (last item in array)
        const latestData = response.data[response.data.length - 1];

        // Format the data to match our StockData interface
        const formattedData = {
          symbol: response.ticker,
          date: latestData.date,
          close: latestData.close,
          previous_closes: response.data
            .slice(0, -1)
            .map((item: { date: string; close: number }) => ({
              date: item.date,
              close: item.close,
            })),
        };

        // Format the stock data to 2 decimal places
        const formattedStock: StockData = formatStockData(formattedData);

        setStock(formattedStock);
      } catch (err) {
        console.error('Fetch error:', err);
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialStock();
  }, []); // Empty dependency array - only run once on mount

  return (
    <StockContext.Provider
      value={{
        stock,
        loading,
        error,
        ticker,
        duration,
        endDate,
        setEndDate,
        setTicker,
        setDuration,
        fetchStock,
      }}
    >
      {children}
    </StockContext.Provider>
  );
};
