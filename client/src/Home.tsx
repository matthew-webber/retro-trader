import { useEffect, useState } from 'react';
import { useStock } from '@/contexts/useStock';

interface StockData {
  symbol: string;
  date: string;
  close: number;
  previous_closes: { date: string; close: number }[];
}

const Home = () => {
  const [stock, setStock] = useState<StockData | null>(null); // Initialize stock as null
  const [loading, setLoading] = useState(true); // Track loading state
  const [error, setError] = useState<string | null>(null); // Track error state

  const [shares, setShares] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [profit, setProfit] = useState<number | null>(null);
  const [calcError, setCalcError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/random-stock')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: Failed to fetch stock data`);
        }
        return res.json();
      })
      .then((data) => {
        if (!data.symbol || !data.date || typeof data.close !== 'number') {
          throw new Error('Invalid stock data format');
        }
        setStock(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        console.error('Fetch error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stock) return;

    setSubmitting(true);
    setProfit(null);
    setCalcError(null);

    try {
      const res = await fetch('/api/calc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: stock.symbol,
          purchase_date: stock.date,
          shares,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCalcError(data.error || 'Calculation error');
      } else {
        setProfit(data.profit);
      }
    } catch {
      setCalcError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error || !stock) {
    return <p>Error: {error || 'Unable to load stock data'}</p>;
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error || !stock) {
    return <p>Error: {error || 'Unable to load stock data'}</p>;
  }

  return (
    <>
      <div>
        <h2>
          {stock.symbol} on {stock.date}
        </h2>
        <p>Close: ${stock.close.toFixed(2)}</p>
        {stock.previous_closes?.length > 0 && (
          <div>
            <h3>Previous closes</h3>
            <ul>
              {stock.previous_closes.map(({ date, close }) => (
                <li key={date}>
                  {date}: ${close.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <label>
            Shares:
            <input
              type="number"
              min="1"
              step="any"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={submitting}>
            Calculate
          </button>
        </form>
        {calcError && <p>{calcError}</p>}
        {profit !== null && (
          <p>
            Profit/Loss: {profit >= 0 ? '+' : ''}
            {profit.toFixed(2)}
          </p>
        )}
      </div>
    </>
  );
};

export default Home;
