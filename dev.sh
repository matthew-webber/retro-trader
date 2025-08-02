#!/bin/bash

# This script is used to start both the server and client for the Retro Trader application.

# Activate the virtual environment
source venv/bin/activate

# Start the server
npm run server &

# Start the client
npm run client