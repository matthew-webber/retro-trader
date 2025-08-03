import { useState } from 'react';
import { useStock } from '@/contexts/useStock';

const Home = () => {
  const {
    stock,
    loading,
    error,
    ticker,
    duration,
    setTicker,
    setDuration,
    fetchStock,
  } = useStock();

  const [shares, setShares] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [profit, setProfit] = useState<number | null>(null);
  const [calcError, setCalcError] = useState<string | null>(null);

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

  const handleFetchStock = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStock(ticker, duration);
  };

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

        {/* Stock Configuration Form */}
        <form onSubmit={handleFetchStock}>
          <div>
            <label>
              Ticker:
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="e.g. AAPL"
                required
              />
            </label>
          </div>
          <div>
            <label>
              Historical Duration (days):
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              >
                <option value={10}>10 days</option>
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
                <option value={90}>90 days</option>
              </select>
            </label>
          </div>
          <button type="submit">Fetch Stock Data</button>
        </form>

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

        {/* Profit Calculation Form */}
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
            Profit/Loss: {profit >= 0 ? '+' : ''}${Math.abs(profit).toFixed(2)}
          </p>
        )}
      </div>
    </>
  );
};

export default Home;
