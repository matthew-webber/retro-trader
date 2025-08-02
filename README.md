# retro-trader

A minimal Flask application with a React front-end.

Run the API with:

```
python -m retrotrader
```

or using Flask's CLI:

```
flask --app retrotrader run
```

## API Endpoints

- `/api/sanity-check` - Returns a simple message to verify the API is running.
- `/api/random-stock` - Fetches a random stock's latest closing price along with previous closing prices using [yfinance](https://github.com/ranaroussi/yfinance).
- `/api/calc` - Calculates profit or loss for a stock position based on ticker, purchase date, and share count.
