import { useEffect, useState } from 'react';

interface StockData {
  symbol: string;
  date: string;
  close: number;
  previous_closes: { date: string; close: number }[];
}

function Game() {
  const [stock, setStock] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shares, setShares] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [profit, setProfit] = useState<number | null>(null);
  const [calcError, setCalcError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/random-stock')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch stock data');
        }
        return res.json();
      })
      .then((data) => {
        setStock(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stock) return;

    setSubmitting(true);
    setProfit(null);
    setCalcError(null);

    fetch('/api/calc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticker: stock.symbol,
        purchase_date: stock.date,
        shares,
      }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          setCalcError(data.error || 'Calculation error');
        } else {
          setProfit(data.profit);
        }
        setSubmitting(false);
      })
      .catch(() => {
        setCalcError('Network error');
        setSubmitting(false);
      });
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error || !stock) {
    return <p>Error: {error || 'Unable to load stock data'}</p>;
  }

  return (
    <div className="game">
      <h2>
        {stock.symbol} on {stock.date}
      </h2>
      <p>Close: ${stock.close.toFixed(2)}</p>
      {stock.previous_closes?.length > 0 && (
        <div className="context">
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
      <form className="trade-form" onSubmit={handleSubmit}>
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
      {calcError && <p className="result">{calcError}</p>}
      {profit !== null && (
        <p className="result">
          Profit/Loss: {profit >= 0 ? '+' : ''}
          {profit.toFixed(2)}
        </p>
      )}
    </div>
  );
}

export default Game;
