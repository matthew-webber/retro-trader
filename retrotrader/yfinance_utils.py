import random
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

import yfinance as yf

# List of potential stock symbols to choose from
DEFAULT_SYMBOLS: List[str] = [
    "AAPL",
    "MSFT",
    "GOOGL",
    "AMZN",
    "META",
    "TSLA",
    "NFLX",
    "NVDA",
    "INTC",
    "IBM",
]


def get_random_stock_data(days: int = 5) -> Dict[str, Any]:
    """Fetch recent historical data for a random stock symbol."""
    symbol = random.choice(DEFAULT_SYMBOLS)
    ticker = yf.Ticker(symbol)
    history = ticker.history(period=f"{days}d")
    history = history.reset_index()
    if history.empty:
        return {}
    last_row = history.iloc[-1]
    closing_price = float(last_row["Close"])
    date_str = last_row["Date"].strftime("%Y-%m-%d")

    previous_prices = [
        {
            "date": row["Date"].strftime("%Y-%m-%d"),
            "close": float(row["Close"]),
        }
        for _, row in history.iloc[:-1].iterrows()
    ]

    return {
        "symbol": symbol,
        "date": date_str,
        "close": closing_price,
        "previous_closes": previous_prices,
    }


def calculate_profit(ticker: str, purchase_date: str, shares: float) -> Optional[float]:
    """Calculate profit or loss for a given stock position."""
    try:
        datetime.strptime(purchase_date, "%Y-%m-%d")
    except ValueError:
        return None

    ticker_obj = yf.Ticker(ticker)
    today = datetime.utcnow().date()

    history = ticker_obj.history(
        start=purchase_date,
        end=(today + timedelta(days=1)).strftime("%Y-%m-%d"),
    )
    if history.empty:
        return None
    purchase_close = float(history.iloc[0]["Close"])

    today_history = ticker_obj.history(period="1d")
    if today_history.empty:
        return None
    today_close = float(today_history["Close"].iloc[-1])

    return (today_close - purchase_close) * shares


def get_stock_data(ticker: str, start_date: str, end_date: str) -> Dict[str, Any]:
    """Fetch stock data for a specific ticker and date range."""
    if not start_date or not end_date:
        # set default to last 30 days if no dates provided
        end = (datetime.now()).strftime("%Y-%m-%d")
        start = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
    else:
        try:
            start = datetime.strptime(start_date, "%Y-%m-%d")
            end = datetime.strptime(end_date, "%Y-%m-%d")
        except ValueError:
            return {}

    ticker_obj = yf.Ticker(ticker)
    history = ticker_obj.history(
        # dev note: start is inclusive, end is exclusive
        start=start,
        end=end,
    )

    if history.empty:
        return {}

    history = history.reset_index()
    data = {
        "ticker": ticker,
        "data": [
            {
                "date": row["Date"].strftime("%Y-%m-%d"),
                "open": float(row["Open"]),
                "high": float(row["High"]),
                "low": float(row["Low"]),
                "close": float(row["Close"]),
                "volume": int(row["Volume"]),
            }
            for _, row in history.iterrows()
        ],
    }
    return data
