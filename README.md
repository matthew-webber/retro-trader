# retro-trader

A minimal Flask application with a React front-end.

## API Endpoints

- `/api/data` - Returns a simple message.
- `/api/random-stock` - Fetches a random stock's latest closing price along with previous closing prices using [yfinance](https://github.com/ranaroussi/yfinance).
- `/api/calc` - Calculates profit or loss for a stock position based on ticker, purchase date, and share count.
