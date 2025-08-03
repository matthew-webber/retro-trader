# RetroTrade

RetroTrade is an educational stock trading simulator that helps users practice evaluating historical market conditions. Each round displays the closing price of a stock from a past date along with recent price history. You choose whether to buy, sell, or short a number of shares, then the app jumps forward in time and reports how the position would have performed.

## Features
- Review historical price movements to learn how markets behave.
- Place hypothetical buy, sell, or short orders and see the outcome.
- Track cumulative gains and losses across multiple rounds.

## Technology Stack
- **Backend:** Python / Flask with [yfinance](https://github.com/ranaroussi/yfinance) for pricing data.
- **Frontend:** React + TypeScript built with Vite.
- Utility scripts use `concurrently` to run both servers during development.

## Getting Started
### Requirements
- Python 3.11+
- Node.js 18+

### Installation
Install Python dependencies:
```bash
pip install -r requirements.txt
```

Install frontend dependencies:
```bash
npm install
cd client && npm install
```

### Running the App
Start the backend:
```bash
python -m retrotrader
# or
flask --app retrotrader run
```

Launch the frontend:
```bash
cd client
npm run dev
```

## API Endpoints
- `/api/sanity-check` – verify the API is running.
- `/api/random-stock` – fetch a stock's latest closing price and recent history.
- `/api/calc` – compute profit or loss for a position given a ticker, purchase date, and share count.

## Development
Run both frontend and backend with automatic restarts:
```bash
npm run dev
```

## License
This project is available under the ISC license. See the [LICENSE](LICENSE) file for details.

## Disclaimer
RetroTrade is intended for educational and entertainment purposes only and does not constitute financial advice.
