#!/usr/bin/env python3
"""
Fetch historical quote JSON from Nasdaq for a list of tickers and save each response
to a file named <TICKER>.json.

Example usage:
    python fetch_nasdaq_hist.py --symbols META,AAPL,MSFT
    python fetch_nasdaq_hist.py --file tickers.txt --fromdate 2025-07-02 --todate 2025-08-02
"""

import argparse
import json
import os
import sys
import time
import logging
from typing import List, Optional

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

DEFAULT_FROMDATE = "2025-07-02"
DEFAULT_TODATE = "2025-08-02"
DEFAULT_LIMIT = "9999"
DEFAULT_RANDOM = "8"
DEFAULT_SLEEP = 1.0  # seconds between requests to be polite / avoid throttling

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)


def build_session() -> requests.Session:
    """Create a requests Session with retry strategy."""
    session = requests.Session()
    retries = Retry(
        total=5,
        backoff_factor=1,  # exponential backoff: 1s,2s,4s,...
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET", "HEAD"],
        raise_on_status=False,
        respect_retry_after_header=True,
    )
    adapter = HTTPAdapter(max_retries=retries)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    return session


def fetch_for_symbol(
    session: requests.Session,
    symbol: str,
    fromdate: str,
    todate: str,
    limit: str,
    random: str,
    output_dir: str,
    max_attempts: int = 5,
    sleep_between: float = DEFAULT_SLEEP,
) -> None:
    """Fetch the historical data for one symbol and save to JSON file."""
    symbol_clean = symbol.strip().upper()
    if not symbol_clean:
        return
    url_template = (
        "https://api.nasdaq.com/api/quote/{symbol}/historical"
        "?assetclass=stocks&fromdate={fromdate}&limit={limit}&todate={todate}&random={random}"
    )
    url = url_template.format(
        symbol=symbol_clean, fromdate=fromdate, todate=todate, limit=limit, random=random
    )

    headers = {
        # Nasdaq API often requires some common headers to behave like a real browser
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": f"https://www.nasdaq.com/market-activity/stocks/{symbol_clean}/historical",
        "Connection": "keep-alive",
    }

    attempt = 0
    while attempt < max_attempts:
        attempt += 1
        try:
            logging.info("Fetching %s (attempt %d)", symbol_clean, attempt)
            resp = session.get(url, headers=headers, timeout=15)
            status = resp.status_code
            if status == 200:
                try:
                    data = resp.json()
                except ValueError:
                    logging.error("Failed to parse JSON for %s; saving raw text.", symbol_clean)
                    data = {"_raw_text": resp.text}
                out_path = os.path.join(output_dir, f"{symbol_clean}.json")
                with open(out_path, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                logging.info("Saved %s to %s", symbol_clean, out_path)
                return
            elif status in (429, 500, 502, 503, 504):
                # Retryable errors
                backoff = 2 ** (attempt - 1)
                logging.warning(
                    "Received status %s for %s; backing off %s seconds and retrying.",
                    status,
                    symbol_clean,
                    backoff,
                )
                time.sleep(backoff)
                continue
            else:
                # Non-retryable or unexpected status
                logging.error(
                    "Non-success status %s for %s. Response text: %s",
                    status,
                    symbol_clean,
                    resp.text[:500],
                )
                break
        except requests.RequestException as e:
            backoff = 2 ** (attempt - 1)
            logging.warning(
                "Request exception for %s on attempt %d: %s. Backing off %s seconds.",
                symbol_clean,
                attempt,
                str(e),
                backoff,
            )
            time.sleep(backoff)
        # polite delay between attempts to avoid hammering
        time.sleep(sleep_between)

    logging.error("Failed to fetch data for %s after %d attempts.", symbol_clean, attempt)


def load_symbols_from_file(path: str) -> List[str]:
    with open(path, "r", encoding="utf-8") as f:
        lines = [line.strip() for line in f if line.strip()]
    return lines


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Fetch Nasdaq historical JSON for a list of stock symbols."
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument(
        "--symbols",
        help="Comma-separated list of symbols, e.g. META,AAPL,MSFT",
        type=str,
    )
    group.add_argument(
        "--file",
        help="File path with one symbol per line",
        type=str,
    )
    parser.add_argument(
        "--fromdate",
        help=f"Start date in YYYY-MM-DD (default: {DEFAULT_FROMDATE})",
        default=DEFAULT_FROMDATE,
        type=str,
    )
    parser.add_argument(
        "--todate",
        help=f"End date in YYYY-MM-DD (default: {DEFAULT_TODATE})",
        default=DEFAULT_TODATE,
        type=str,
    )
    parser.add_argument(
        "--limit",
        help=f"Limit parameter (default: {DEFAULT_LIMIT})",
        default=DEFAULT_LIMIT,
        type=str,
    )
    parser.add_argument(
        "--random",
        help=f"Random query param to bypass caching (default: {DEFAULT_RANDOM})",
        default=DEFAULT_RANDOM,
        type=str,
    )
    parser.add_argument(
        "--output-dir",
        help="Directory where JSON files will be saved (default: ./output)",
        default="output",
        type=str,
    )
    parser.add_argument(
        "--delay",
        help="Seconds to wait between successful requests (default: 1.0)",
        default=DEFAULT_SLEEP,
        type=float,
    )
    return parser.parse_args()


def main():
    args = parse_args()
    if args.symbols:
        symbols = [s.strip() for s in args.symbols.split(",") if s.strip()]
    else:
        symbols = load_symbols_from_file(args.file)

    os.makedirs(args.output_dir, exist_ok=True)

    session = build_session()

    for i, symbol in enumerate(symbols, start=1):
        logging.info("(%d/%d) Processing symbol %s", i, len(symbols), symbol)
        fetch_for_symbol(
            session=session,
            symbol=symbol,
            fromdate=args.fromdate,
            todate=args.todate,
            limit=args.limit,
            random=args.random,
            output_dir=args.output_dir,
            sleep_between=args.delay,
        )
        # polite pause between different symbols
        time.sleep(args.delay)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logging.warning("Interrupted by user; exiting.")
        sys.exit(1)