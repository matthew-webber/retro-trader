from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
app.url_map.strict_slashes = False
CORS(app)

# Register routes
from . import routes  # noqa: E402,F401
