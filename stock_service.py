import random
from datetime import datetime
from typing import List, Dict, Any

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
    """Fetch recent historical data for a random stock symbol.

    Parameters
    ----------
    days: int
        Number of days of history to return (including most recent day).
    """
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
