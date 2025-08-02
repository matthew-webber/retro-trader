from flask import Flask, jsonify
from flask_cors import CORS

from stock_service import get_random_stock_data

app = Flask(__name__)
CORS(app)


@app.route("/api/data", methods=["GET"])
def get_data():
    """Example endpoint returning a simple message."""
    data = {"message": "Hello, World!"}
    return jsonify(data)


@app.route("/api/random-stock", methods=["GET"])
def random_stock():
    """Return a random stock's recent closing prices."""
    data = get_random_stock_data()
    if not data:
        return jsonify({"error": "No data found"}), 404
    return jsonify(data)


if __name__ == "__main__":
    app.run(debug=True)
