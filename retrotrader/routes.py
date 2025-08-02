from flask import jsonify, request

from . import app
from .yfinance_utils import get_random_stock_data, calculate_profit


@app.route("/api/sanity-check", methods=["GET"])
def get_data():
    """Example endpoint returning a simple message."""
    return jsonify({"message": "Hello, World!"})


@app.route("/api/random-stock", methods=["GET"])
def random_stock():
    """Return a random stock's recent closing prices."""
    data = get_random_stock_data()
    if not data:
        return jsonify({"error": "No data found"}), 404
    return jsonify(data)


@app.route("/api/calc", methods=["POST"])
def calc_profit():
    """Calculate profit or loss for a given stock position."""
    payload = request.get_json(force=True, silent=True) or {}
    ticker = payload.get("ticker")
    purchase_date = payload.get("purchase_date")
    shares = payload.get("shares")

    try:
        shares = float(shares)
        if shares <= 0:
            raise ValueError
    except (TypeError, ValueError):
        return jsonify({"error": "Shares must be a positive number"}), 400

    profit = calculate_profit(ticker, purchase_date, shares)
    if profit is None:
        return jsonify({"error": "Price data unavailable"}), 400
    return jsonify({"profit": profit})

